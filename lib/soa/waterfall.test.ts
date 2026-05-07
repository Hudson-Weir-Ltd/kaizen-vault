import { describe, it, expect } from "vitest";
import { computePrescribedPart, computeWaterfall } from "./waterfall";
import type { CaseAsset, CaseCharge, CaseLiability } from "@/types";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const baseSync = {
  hw_updated_at: "2026-04-01T00:00:00Z",
  kz_updated_at: "2026-04-01T00:00:00Z",
  sync_version: 1,
  sync_origin: "hw" as const,
};

function asset(partial: Partial<CaseAsset>): CaseAsset {
  return {
    id: partial.id ?? crypto.randomUUID(),
    hw_case_id: "case-1",
    description: null,
    category: null,
    charge_status: null,
    asset_type: null,
    charge_holder_name: null,
    book_value: null,
    etr: null,
    secured_debt: null,
    realised_amount: null,
    soa_book_value: null,
    soa_estimated_to_realise: null,
    sip6_explanation: null,
    etr_uncertain: false,
    status: null,
    realised_date: null,
    parent_asset_id: null,
    charge_id: null,
    sort_order: 0,
    deleted_at: null,
    ...baseSync,
    ...partial,
  };
}

function liability(partial: Partial<CaseLiability>): CaseLiability {
  return {
    id: partial.id ?? crypto.randomUUID(),
    hw_case_id: "case-1",
    creditor_name: null,
    category: null,
    amount: null,
    soa_amount: null,
    proof_received: false,
    proof_of_debt_date: null,
    proof_of_debt_amount: null,
    creditor_type: null,
    address: null,
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    reference_number: null,
    security_details: null,
    security_date: null,
    security_value: null,
    currency: "GBP",
    original_amount: null,
    exchange_rate: null,
    exchange_rate_date: null,
    description: null,
    sort_order: 0,
    deleted_at: null,
    ...baseSync,
    ...partial,
  };
}

function charge(partial: Partial<CaseCharge> & { charge_type: CaseCharge["charge_type"] }): CaseCharge {
  return {
    id: partial.id ?? crypto.randomUUID(),
    hw_case_id: "case-1",
    charge_holder_name: null,
    creditor_id: null,
    agreement_date: null,
    charge_amount: null,
    attached_asset_ids: [],
    ch_charge_code: null,
    description: null,
    sort_order: 0,
    deleted_at: null,
    ...baseSync,
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// Prescribed part — IA 1986 s.176A, capped £800k since 6 April 2020
// ---------------------------------------------------------------------------

describe("computePrescribedPart", () => {
  it("returns zero for zero or negative realisations", () => {
    expect(computePrescribedPart(0).prescribedPart).toBe(0);
    expect(computePrescribedPart(-100).prescribedPart).toBe(0);
  });

  it("first band: 50% of realisations up to £10,000", () => {
    expect(computePrescribedPart(5_000).prescribedPart).toBe(2_500);
    expect(computePrescribedPart(10_000).prescribedPart).toBe(5_000);
  });

  it("second band: £5,000 + 20% of excess above £10,000", () => {
    // £20,000 -> 5,000 + 20% * 10,000 = 7,000
    expect(computePrescribedPart(20_000).prescribedPart).toBe(7_000);
    // £100,000 -> 5,000 + 20% * 90,000 = 23,000
    expect(computePrescribedPart(100_000).prescribedPart).toBe(23_000);
  });

  it("caps at £800,000", () => {
    // 800,000 cap hit at: 5000 + 0.2 * (X - 10000) >= 800000 => X >= 3,985,000
    const result = computePrescribedPart(5_000_000);
    expect(result.prescribedPart).toBe(800_000);
    expect(result.capped).toBe(true);
    expect(result.floatingChargeRemainder).toBe(4_200_000);
  });

  it("not capped when below the cap threshold", () => {
    expect(computePrescribedPart(50_000).capped).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Full waterfall — happy paths
// ---------------------------------------------------------------------------

describe("computeWaterfall", () => {
  it("handles an empty case", () => {
    const r = computeWaterfall({ assets: [], liabilities: [], charges: [] });
    expect(r.totalForUnsecured).toBe(0);
    expect(r.totalUnsec).toBe(0);
    expect(r.totalDeficiency).toBe(0);
    expect(r.charges).toEqual([{
      chargeId: null,
      chargeType: "uncharged",
      chargeHolderName: null,
      totalRealisation: 0,
      securedDebt: 0,
      surplus: 0,
      shortfallToUnsecured: 0,
      assetCount: 0,
    }]);
  });

  it("treats sold assets at realised_amount, otherwise ETR, otherwise zero", () => {
    const r = computeWaterfall({
      assets: [
        asset({ etr: 1000, status: "sold", realised_amount: 1200 }),
        asset({ etr: 500 }),
        asset({ etr: null }),
      ],
      liabilities: [],
      charges: [],
    });
    // Uncharged bucket sums (sold takes realised_amount)
    expect(r.charges[0].totalRealisation).toBe(1700);
  });

  it("uses SoA snapshot ETR over live ETR when present", () => {
    const r = computeWaterfall({
      assets: [asset({ etr: 5000, soa_estimated_to_realise: 4000 })],
      liabilities: [],
      charges: [],
    });
    expect(r.charges[0].totalRealisation).toBe(4000);
  });

  it("computes secured-fixed surplus and feeds preferentials", () => {
    const fc = charge({ id: "fc1", charge_type: "fixed", charge_amount: 50_000, charge_holder_name: "Bank A" });
    const r = computeWaterfall({
      charges: [fc],
      assets: [asset({ etr: 80_000, charge_id: "fc1" })],
      liabilities: [
        liability({ category: "secured_fixed", amount: 50_000 }),
        liability({ category: "preferential", amount: 5_000 }),
        liability({ category: "secondary_preferential", amount: 10_000 }),
        liability({ category: "unsecured", amount: 100_000 }),
      ],
    });

    // Secured fixed paid in full
    expect(r.estimatedPayouts.secured_fixed).toBe(50_000);
    // Surplus 30,000 cascades to preferentials
    expect(r.estimatedPayouts.preferential).toBe(5_000);
    expect(r.estimatedPayouts.secondary_preferential).toBe(10_000);
    // 15,000 left for unsecured
    expect(r.totalForUnsecured).toBeGreaterThan(0);
    expect(r.totalForUnsecured).toBe(15_000);
    // Unsecured short by 100k - 15k = 85k
    expect(r.deficiencyNonPref).toBe(-85_000);
  });

  it("applies prescribed part on floating realisations and tops up unsecured", () => {
    const fl = charge({ id: "fl1", charge_type: "floating", charge_amount: 200_000, charge_holder_name: "Bank B" });
    const r = computeWaterfall({
      charges: [fl],
      assets: [asset({ etr: 100_000, charge_id: "fl1" })],
      liabilities: [
        liability({ category: "secured_floating", amount: 200_000 }),
        liability({ category: "unsecured", amount: 50_000 }),
      ],
    });

    // PP from £100k floating: 5,000 + 20% * 90,000 = 23,000
    expect(r.prescribedPart.prescribedPart).toBe(23_000);
    expect(r.prescribedPart.floatingChargeRemainder).toBe(77_000);

    // Floating charge paid 77k (remainder), shortfall 100k goes to unsecured pool
    // (200k debt - 100k realisation = 100k shortfall, before PP).
    expect(r.estimatedPayouts.secured_floating).toBe(77_000);
    // Unsecured pool gets prescribed part (23k); total claims = 50k orig +
    // 100k secured_floating shortfall = 150k.
    expect(r.totalForUnsecured).toBe(23_000);
    expect(r.totalUnsec).toBe(150_000);
    // Deficiency = pool (23k) − unsecured claims (150k) = -127k
    expect(r.deficiencyNonPref).toBe(-127_000);
  });

  it("ignores soft-deleted rows", () => {
    const r = computeWaterfall({
      assets: [
        asset({ etr: 1_000 }),
        asset({ etr: 9_000, deleted_at: "2026-04-15T00:00:00Z" }),
      ],
      liabilities: [
        liability({ category: "unsecured", amount: 500 }),
        liability({ category: "unsecured", amount: 9_000, deleted_at: "2026-04-15T00:00:00Z" }),
      ],
      charges: [],
    });
    expect(r.charges[0].totalRealisation).toBe(1_000);
    expect(r.totalUnsec).toBe(500);
  });

  it("totalDeficiency = sum of class shortfalls", () => {
    const r = computeWaterfall({
      assets: [asset({ etr: 1_000 })],
      liabilities: [
        liability({ category: "preferential", amount: 5_000 }),
        liability({ category: "unsecured", amount: 10_000 }),
      ],
      charges: [],
    });
    // Pref gets 1,000; unsecured gets 0
    expect(r.estimatedPayouts.preferential).toBe(1_000);
    expect(r.estimatedPayouts.unsecured).toBe(0);
    // Shortfalls: pref 4,000 + unsec 10,000
    expect(r.totalDeficiency).toBe(14_000);
  });
});
