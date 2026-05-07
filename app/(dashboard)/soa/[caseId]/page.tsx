import { redirect } from "next/navigation";

export default async function CaseRoot({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  redirect(`/soa/${caseId}/assets`);
}
