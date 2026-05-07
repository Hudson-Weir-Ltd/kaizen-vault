"use client";

import { useParams } from "next/navigation";
import { useCaseSync } from "@/lib/soa/hooks";
import ChargesGrid from "@/components/soa/ChargesGrid";

export default function CaseChargesPage() {
  const params = useParams<{ caseId: string }>();
  const { data } = useCaseSync(params?.caseId);
  if (!data) return null;
  return <ChargesGrid charges={data.charges} />;
}
