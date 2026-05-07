import KPIGrid from "@/components/KPIGrid";
import ServiceHealthGrid from "@/components/ServiceHealthGrid";
import ActivityFeed from "@/components/ActivityFeed";
import MaturityScoreCard from "@/components/MaturityScoreCard";
import PipelineIdeas from "@/components/PipelineIdeas";
import TodayDate from "@/components/TodayDate";
import PageHeader from "@/components/PageHeader";
import AutomationTrendChartLazy from "@/components/AutomationTrendChartLazy";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Command Center"
        subtitle={<TodayDate />}
        right={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              padding: "6px 14px",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--green)",
                boxShadow: "0 0 8px var(--green)",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--green)" }}>
              All Systems Operational
            </span>
          </div>
        }
      />

      <div
        style={{
          padding: "28px 32px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <section>
          <KPIGrid />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <ServiceHealthGrid />
          <ActivityFeed />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <AutomationTrendChartLazy />
          <MaturityScoreCard />
        </section>

        <section>
          <PipelineIdeas />
        </section>
      </div>

      <footer
        style={{
          padding: "16px 32px",
          borderTop: "1px solid var(--card-border)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "11px", color: "#334155" }}>
          Kaizen OS v0.1.0 &middot; HR Service Intelligence Platform &middot; &copy; 2026
        </p>
      </footer>
    </>
  );
}
