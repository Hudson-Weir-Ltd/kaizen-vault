"use client";

import { useParams } from "next/navigation";
import { useCaseSync } from "@/lib/soa/hooks";
import AssetsGrid from "@/components/soa/AssetsGrid";

export default function CaseAssetsPage() {
  const params = useParams<{ caseId: string }>();
  const { data } = useCaseSync(params?.caseId);
  if (!data) return null;
  return <AssetsGrid assets={data.assets} />;
}
