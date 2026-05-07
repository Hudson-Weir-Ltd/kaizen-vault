/**
 * Statement of Affairs domain types — Stage C placeholder.
 *
 * Mirrors a subset of Hudson One's `case_assets`, `case_liabilities`,
 * `case_charges` columns. Will be populated in Stage C-1.2 once the
 * mirror schema lands.
 */

export type ChargeStatus =
  | "uncharged"
  | "fixed_charge"
  | "floating_charge"
  | "hire_purchase"
  | "specifically_pledged";

export type ChargeType = "floating" | "fixed" | "specifically_pledged" | "hire_purchase";

export type AssetCategory = "fixed" | "current";

export type CreditorCategory =
  | "preferential"
  | "secondary_preferential"
  | "secured_fixed"
  | "secured_floating"
  | "unsecured"
  | "consumer"
  | "employee"
  | "connected_party";

export type AssetRealisationStatus =
  | "not_realised"
  | "marketed"
  | "sold"
  | "abandoned"
  | "returned_to_owner";

export type SyncOrigin = "hw" | "kz";

export interface SyncMetadata {
  hw_updated_at: string | null;
  kz_updated_at: string;
  sync_version: number;
  sync_origin: SyncOrigin;
}

export interface CaseAsset extends SyncMetadata {
  id: string;
  hw_case_id: string;
  description: string | null;
  category: AssetCategory | null;
  charge_status: ChargeStatus | null;
  asset_type: string | null;
  charge_holder_name: string | null;
  book_value: number | null;
  etr: number | null;
  secured_debt: number | null;
  realised_amount: number | null;
  soa_book_value: number | null;
  soa_estimated_to_realise: number | null;
  sip6_explanation: string | null;
  etr_uncertain: boolean;
  status: AssetRealisationStatus | null;
  realised_date: string | null;
  parent_asset_id: string | null;
  charge_id: string | null;
  sort_order: number;
  deleted_at: string | null;
}

export interface CaseLiability extends SyncMetadata {
  id: string;
  hw_case_id: string;
  creditor_name: string | null;
  category: CreditorCategory | null;
  amount: number | null;
  soa_amount: number | null;
  proof_received: boolean;
  proof_of_debt_date: string | null;
  proof_of_debt_amount: number | null;
  creditor_type: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  reference_number: string | null;
  security_details: string | null;
  security_date: string | null;
  security_value: number | null;
  currency: string;
  original_amount: number | null;
  exchange_rate: number | null;
  exchange_rate_date: string | null;
  description: string | null;
  sort_order: number;
  deleted_at: string | null;
}

export interface CaseCharge extends SyncMetadata {
  id: string;
  hw_case_id: string;
  charge_type: ChargeType;
  charge_holder_name: string | null;
  creditor_id: string | null;
  agreement_date: string | null;
  charge_amount: number | null;
  attached_asset_ids: string[];
  ch_charge_code: string | null;
  description: string | null;
  sort_order: number;
  deleted_at: string | null;
}
