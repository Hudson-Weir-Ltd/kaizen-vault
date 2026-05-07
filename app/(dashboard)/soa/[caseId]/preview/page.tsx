"use client";

import { useParams } from "next/navigation";
import { useCaseSync } from "@/lib/soa/hooks";
import SoaPreview from "@/components/soa/SoaPreview";

export default function CasePreviewPage() {
  const params = useParams<{ caseId: string }>();
  const { data } = useCaseSync(params?.caseId);
  if (!data) return null;
  return (
    <SoaPreview
      assets={data.assets}
      liabilities={data.liabilities}
      charges={data.charges}
      variant="full"
    />
  );
}
