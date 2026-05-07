"use client";

import { useQuery } from "@tanstack/react-query";
import type { CaseAsset, CaseCharge, CaseLiability } from "@/types";
import type { MockCaseSummary } from "@/data/soa-mock";

/**
 * TanStack Query hooks for SoA data.
 *
 * Stage C-1: queries hit `/api/bridge/*` which currently returns mock data.
 * Stage C-2 will replace the bridge stubs with real Hudson One calls; these
 * hooks won't change.
 */

interface BridgeCasesResponse {
  cases: MockCaseSummary[];
  source: "mock" | "hw";
}

interface BridgeSyncResponse {
  case: MockCaseSummary;
  assets: CaseAsset[];
  liabilities: CaseLiability[];
  charges: CaseCharge[];
  source: "mock" | "hw";
  fetched_at: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bridge request failed (${res.status}): ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function useCases() {
  return useQuery({
    queryKey: ["soa", "cases"],
    queryFn: () => getJson<BridgeCasesResponse>("/api/bridge/cases"),
  });
}

export function useCaseSync(caseId: string | undefined) {
  return useQuery({
    queryKey: ["soa", "case-sync", caseId],
    queryFn: () => getJson<BridgeSyncResponse>(`/api/bridge/sync/${caseId}`),
    enabled: !!caseId,
  });
}
