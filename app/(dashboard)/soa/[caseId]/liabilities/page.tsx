"use client";

import { useParams } from "next/navigation";
import { useCaseSync } from "@/lib/soa/hooks";
import LiabilitiesGrid from "@/components/soa/LiabilitiesGrid";

export default function CaseLiabilitiesPage() {
  const params = useParams<{ caseId: string }>();
  const { data } = useCaseSync(params?.caseId);
  if (!data) return null;
  return <LiabilitiesGrid liabilities={data.liabilities} />;
}
