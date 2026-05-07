import PageHeader from "@/components/PageHeader";
import CasePicker from "@/components/soa/CasePicker";

export default function StatementOfAffairsIndex() {
  return (
    <>
      <PageHeader
        title="Statement of Affairs"
        subtitle="Pick a case to view its assets, liabilities and charges, with a live SoA preview."
      />
      <div style={{ padding: "28px 32px" }}>
        <CasePicker />
      </div>
    </>
  );
}
