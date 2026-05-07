/**
 * IA 1986 s.107 / s.175 / s.176A waterfall calculator.
 *
 * Pure functions only — no React, no database, no side effects. Given the
 * mirrored CaseAsset / CaseLiability / CaseCharge rows for one case, this
 * computes the realisation surplus or shortfall by charge, applies the
 * prescribed part, ranks creditors statutorily, and returns totals you can
 * render directly into the SoA preview.
 *
 * This is an original implementation — the IA 1986 statutory algorithm is
 * not copyrightable, so the *logic* is the same as Hudson One's
 * soa-waterfall-calc.ts but the *code* is fresh. Stage C-3 will swap the
 * inputs for live mirror queries.
 */

import type { CaseAsset, CaseCharge, CaseLiability } from "@/types";
import { PRESCRIBED_PART } from "./constants";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ChargeRealisation {
  chargeId: string | null;          // null = uncharged / not yet allocated
  chargeType: "fixed" | "floating" | "hire_purchase" | "specifically_pledged" | "uncharged";
  chargeHolderName: string | null;
  totalRealisation: number;          // sum(etr or realised_amount across attached assets)
  securedDebt: number;
  surplus: number;                   // > 0 = surplus; < 0 = shortfall to unsecured
  shortfallToUnsecured: number;      // max(0, -surplus)
  assetCount: number;
}

export interface PrescribedPartResult {
  /** Net floating realisations the prescribed-part is computed against. */
  netFloatingRealisations: number;
  /** Slice diverted to non-preferential unsecured creditors. */
  prescribedPart: number;
  /** Amount left for the floating charge holder after the slice. */
  floatingChargeRemainder: number;
  /** True if cap (£800,000) bit. */
  capped: boolean;
}

export interface CreditorClassTotals {
  secured_fixed: number;
  preferential: number;
  secondary_preferential: number;
  secured_floating: number;
  unsecured: number;          // includes consumer + employee unsecured remainders
  connected_party: number;
}

export interface WaterfallResult {
  charges: ChargeRealisation[];
  prescribedPart: PrescribedPartResult;
  /** Total claims by class (what's owed). */
  claims: CreditorClassTotals;
  /** Estimated payouts by class given the realisation pool. */
  estimatedPayouts: CreditorClassTotals;
  /** What's left after preferential / secondary-pref / prescribed-part for pari-passu unsecured pool. */
  totalForUnsecured: number;
  /** Total unsecured claims competing for that pool. */
  totalUnsec: number;
  /** Pool − unsecured claims. Negative = unsecured creditors get partial. */
  deficiencyNonPref: number;
  /** Sum of all shortfalls. Headline number on SoA. */
  totalDeficiency: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);

/**
 * Asset's realisable value for waterfall purposes.
 *
 * Prefer realised_amount when status='sold' (actuals). Fall back to ETR.
 * Use SoA snapshot fields when present (frozen at pre-app lock time) so
 * pre-app SoA stays stable even if later edits change the live values.
 */
function realisationFor(a: CaseAsset): number {
  if (a.status === "sold" && a.realised_amount != null) return a.realised_amount;
  if (a.soa_estimated_to_realise != null) return a.soa_estimated_to_realise;
  return a.etr ?? 0;
}

/**
 * Group assets by their attached charge id. Assets with no charge_id are
 * grouped under `null`. Charges with no attached assets still appear (they
 * may be shortfalls reporting 0 realisation).
 */
function groupByCharge(
  assets: CaseAsset[],
  charges: CaseCharge[]
): Map<string | null, { charge: CaseCharge | null; assets: CaseAsset[] }> {
  const out = new Map<string | null, { charge: CaseCharge | null; assets: CaseAsset[] }>();
  out.set(null, { charge: null, assets: [] });
  for (const c of charges) out.set(c.id, { charge: c, assets: [] });

  for (const a of assets) {
    if (a.deleted_at) continue;
    const key = a.charge_id ?? null;
    const bucket = out.get(key) ?? { charge: null, assets: [] };
    bucket.assets.push(a);
    out.set(key, bucket);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function computeWaterfall(input: {
  assets: CaseAsset[];
  liabilities: CaseLiability[];
  charges: CaseCharge[];
}): WaterfallResult {
  const aliveAssets = input.assets.filter((a) => !a.deleted_at);
  const aliveLiabs = input.liabilities.filter((l) => !l.deleted_at);
  const aliveCharges = input.charges.filter((c) => !c.deleted_at);

  // Realisation per charge
  const grouped = groupByCharge(aliveAssets, aliveCharges);
  const chargeRealisations: ChargeRealisation[] = [];
  for (const [, group] of grouped) {
    const totalRealisation = sum(group.assets.map(realisationFor));
    const securedDebt = group.charge?.charge_amount ?? 0;
    const surplus = totalRealisation - securedDebt;
    const shortfallToUnsecured = Math.max(0, -surplus);
    chargeRealisations.push({
      chargeId: group.charge?.id ?? null,
      chargeType: (group.charge?.charge_type ?? "uncharged") as ChargeRealisation["chargeType"],
      chargeHolderName: group.charge?.charge_holder_name ?? null,
      totalRealisation,
      securedDebt,
      surplus,
      shortfallToUnsecured,
      assetCount: group.assets.length,
    });
  }

  // Prescribed part — applies only to NET floating-charge realisations
  // (after preferential creditors). Simplified for v1: we use gross floating
  // realisations and surface a TODO for Stage C-3 to net off pref claims first
  // when the source-of-truth for pref payouts lands.
  const floatingRealisations = sum(
    chargeRealisations.filter((c) => c.chargeType === "floating").map((c) => Math.max(0, c.totalRealisation))
  );
  const prescribedPart = computePrescribedPart(floatingRealisations);

  // Claims totals by class
  const claims: CreditorClassTotals = {
    secured_fixed: 0,
    preferential: 0,
    secondary_preferential: 0,
    secured_floating: 0,
    unsecured: 0,
    connected_party: 0,
  };
  for (const l of aliveLiabs) {
    const amt = (l.soa_amount ?? l.amount) ?? 0;
    switch (l.category) {
      case "secured_fixed":
        claims.secured_fixed += amt;
        break;
      case "secured_floating":
        claims.secured_floating += amt;
        break;
      case "preferential":
        claims.preferential += amt;
        break;
      case "secondary_preferential":
        claims.secondary_preferential += amt;
        break;
      case "connected_party":
        claims.connected_party += amt;
        break;
      case "unsecured":
      case "consumer":
      case "employee":
      default:
        claims.unsecured += amt;
        break;
    }
  }

  // Add secured shortfalls into unsecured pool (s.165(2) treatment)
  const securedShortfallToUnsecured = sum(
    chargeRealisations
      .filter((c) => c.chargeType === "fixed" || c.chargeType === "floating")
      .map((c) => c.shortfallToUnsecured)
  );
  claims.unsecured += securedShortfallToUnsecured;

  // Estimated payouts
  const fixedRealisations = sum(
    chargeRealisations.filter((c) => c.chargeType === "fixed").map((c) => Math.max(0, c.totalRealisation))
  );
  const uncharged = sum(
    chargeRealisations.filter((c) => c.chargeType === "uncharged").map((c) => c.totalRealisation)
  );

  // Pool waterfall
  const securedFixedPay = Math.min(claims.secured_fixed, fixedRealisations);
  // (uncharged + fixed surplus) feeds the preferential creditor pool
  const fixedSurplusToPref = sum(
    chargeRealisations.filter((c) => c.chargeType === "fixed").map((c) => Math.max(0, c.surplus))
  );

  let preferentialPool = uncharged + fixedSurplusToPref;
  const prefPay = Math.min(claims.preferential, preferentialPool);
  preferentialPool -= prefPay;

  const secPrefPay = Math.min(claims.secondary_preferential, preferentialPool);
  preferentialPool -= secPrefPay;

  // After pref + secondary pref, remainder + floating realisations net of pp
  // pay the floating charge holder, then unsecured.
  const floatingForCharge = prescribedPart.floatingChargeRemainder + preferentialPool;
  const securedFloatingPay = Math.min(claims.secured_floating, floatingForCharge);
  const remainderAfterFloating = floatingForCharge - securedFloatingPay;

  // Unsecured pool = remainder + prescribed part
  const totalForUnsecured = remainderAfterFloating + prescribedPart.prescribedPart;
  const totalUnsec = claims.unsecured + claims.connected_party;
  const unsecPay = Math.min(claims.unsecured, totalForUnsecured);
  const connectedPay = Math.min(
    claims.connected_party,
    Math.max(0, totalForUnsecured - claims.unsecured)
  );

  const estimatedPayouts: CreditorClassTotals = {
    secured_fixed: securedFixedPay,
    preferential: prefPay,
    secondary_preferential: secPrefPay,
    secured_floating: securedFloatingPay,
    unsecured: unsecPay,
    connected_party: connectedPay,
  };

  const deficiencyNonPref = totalForUnsecured - totalUnsec;
  const totalDeficiency =
    (claims.secured_fixed - securedFixedPay) +
    (claims.preferential - prefPay) +
    (claims.secondary_preferential - secPrefPay) +
    (claims.secured_floating - securedFloatingPay) +
    (claims.unsecured - unsecPay) +
    (claims.connected_party - connectedPay);

  return {
    charges: chargeRealisations,
    prescribedPart,
    claims,
    estimatedPayouts,
    totalForUnsecured,
    totalUnsec,
    deficiencyNonPref,
    totalDeficiency,
  };
}

// ---------------------------------------------------------------------------
// Prescribed part — exported for direct testing
// ---------------------------------------------------------------------------

export function computePrescribedPart(netFloatingRealisations: number): PrescribedPartResult {
  if (netFloatingRealisations <= 0) {
    return {
      netFloatingRealisations: 0,
      prescribedPart: 0,
      floatingChargeRemainder: 0,
      capped: false,
    };
  }

  const { firstBandCeiling, firstBandRate, secondBandRate, cap } = PRESCRIBED_PART;
  let pp = 0;
  if (netFloatingRealisations <= firstBandCeiling) {
    pp = netFloatingRealisations * firstBandRate;
  } else {
    pp = firstBandCeiling * firstBandRate + (netFloatingRealisations - firstBandCeiling) * secondBandRate;
  }
  const capped = pp > cap;
  if (capped) pp = cap;

  return {
    netFloatingRealisations,
    prescribedPart: pp,
    floatingChargeRemainder: netFloatingRealisations - pp,
    capped,
  };
}
