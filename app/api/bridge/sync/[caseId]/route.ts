import { NextResponse } from "next/server";
import {
  findMockCase,
  getMockAssets,
  getMockCharges,
  getMockLiabilities,
} from "@/data/soa-mock";

/**
 * GET /api/bridge/sync/:caseId — pull-down endpoint. Fetches HW
 * assets/liabilities/charges and would upsert into Kaizen mirror.
 *
 * Stage C-1 stub: returns mock data. Stage C-2 will:
 *  1. Verify access via `kaizen_bridge_check_access(hw_user_id, caseId)` RPC.
 *  2. Pull from HW via service-role-keyed REST.
 *  3. Upsert into soa.case_assets / case_liabilities / case_charges with
 *     sync_origin='hw'.
 *  4. Return the freshly-mirrored rows.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const summary = findMockCase(caseId);
  if (!summary) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  // TODO(stage-c-2.2): replace with real bridge call. Audit-log every fetch.
  return NextResponse.json({
    case: summary,
    assets: getMockAssets(caseId),
    liabilities: getMockLiabilities(caseId),
    charges: getMockCharges(caseId),
    source: "mock",
    fetched_at: new Date().toISOString(),
  });
}
