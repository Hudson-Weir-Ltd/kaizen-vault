/**
 * SoA-domain constants and label maps.
 *
 * Most of these mirror the equivalents in Hudson One's
 * `src/components/soa/constants.ts` so the two apps speak the same vocabulary,
 * but written from scratch here so we can evolve Kaizen labels independently.
 */

import type {
  AssetCategory,
  AssetRealisationStatus,
  ChargeStatus,
  ChargeType,
  CreditorCategory,
} from "@/types";

// ---------------------------------------------------------------------------
// Charge / asset labels
// ---------------------------------------------------------------------------

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  uncharged: "Uncharged",
  fixed_charge: "Fixed Charge",
  floating_charge: "Floating Charge",
  hire_purchase: "Hire Purchase",
  specifically_pledged: "Specifically Pledged",
};

export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  fixed: "Fixed",
  floating: "Floating",
  hire_purchase: "Hire Purchase",
  specifically_pledged: "Specifically Pledged",
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  fixed: "Fixed Assets",
  current: "Current Assets",
};

export const ASSET_STATUS_LABELS: Record<AssetRealisationStatus, string> = {
  not_realised: "Not yet realised",
  marketed: "Marketed",
  sold: "Sold",
  abandoned: "Abandoned",
  returned_to_owner: "Returned to owner",
};

// ---------------------------------------------------------------------------
// Creditor categories
// ---------------------------------------------------------------------------

export const CREDITOR_CATEGORY_LABELS: Record<CreditorCategory, string> = {
  preferential: "Preferential",
  secondary_preferential: "Secondary Preferential",
  secured_fixed: "Secured (Fixed Charge)",
  secured_floating: "Secured (Floating Charge)",
  unsecured: "Unsecured",
  consumer: "Consumer",
  employee: "Employee",
  connected_party: "Connected Party",
};

/**
 * SoA waterfall priority — lower number paid first.
 * Used to sort claims into statutory pay order.
 */
export const CREDITOR_PRIORITY: Record<CreditorCategory, number> = {
  secured_fixed: 1,        // out of fixed-charge realisations
  preferential: 2,         // employees: wages arrears, holiday pay, pension
  secondary_preferential: 3, // HMRC (VAT/PAYE/NIC) since 1 Dec 2020
  secured_floating: 4,     // floating charge holder, after prescribed part
  unsecured: 5,
  consumer: 5,             // ranks pari passu with unsecured
  employee: 5,             // unsecured remainder beyond preferential cap
  connected_party: 6,      // last in unsecured queue
};

// ---------------------------------------------------------------------------
// Statutory constants
// ---------------------------------------------------------------------------

/**
 * IA 1986 s.176A "prescribed part" — top slice of net floating charge
 * realisations diverted to non-preferential unsecured creditors.
 *
 * 50% of the first £10,000, 20% of any excess, capped at £800,000.
 * The £800k cap was introduced by the Insolvency Act 1986 (Prescribed Part)
 * (Amendment) Order 2020, in force from 6 April 2020 (was £600k before).
 *
 * Floating charges created before 15 September 2003 are exempt — Stage C-3
 * will surface a per-charge override flag. v1 ignores the pre-2003 cohort.
 */
export const PRESCRIBED_PART = {
  firstBandCeiling: 10_000,
  firstBandRate: 0.5,
  secondBandRate: 0.2,
  cap: 800_000,
} as const;

/**
 * Preferential employee claim ceiling per IA 1986 Schedule 6 read with
 * the Insolvency Proceedings (Monetary Limits) Order 1986 (SI 1986/1996):
 * arrears of wages capped at £800 per employee. Anything above falls into
 * unsecured.
 */
export const EMPLOYEE_PREF_WAGE_CAP = 800;
