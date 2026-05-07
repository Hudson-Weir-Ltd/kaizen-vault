import { NextResponse } from "next/server";
import { MOCK_CASES } from "@/data/soa-mock";

/**
 * GET /api/bridge/cases — list cases the authenticated Kaizen user can access
 * on Hudson One.
 *
 * Stage C-1 stub: returns hardcoded mock cases. Stage C-2 will:
 *  1. Verify Kaizen JWT (`supabase.auth.getUser()` from server-side client).
 *  2. Resolve `hw_user_id` via `soa.user_links`.
 *  3. Call Hudson One via service-role with `?user_id=hw_user_id` predicate
 *     so RLS on Hudson One re-checks `private.has_case_access`.
 *  4. Mirror result into `soa.case_access`.
 *  5. Return cases.
 */
export async function GET() {
  // TODO(stage-c-2.1): replace with real bridge call. See REFACTOR_PLAN §6.4.2.
  return NextResponse.json({
    cases: MOCK_CASES,
    source: "mock",
  });
}
