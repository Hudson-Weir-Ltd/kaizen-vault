import Sidebar from "@/components/Sidebar";
import KPIGrid from "@/components/KPIGrid";
import ServiceHealthGrid from "@/components/ServiceHealthGrid";
import ActivityFeed from "@/components/ActivityFeed";
import AutomationTrendChart from "@/components/AutomationTrendChart";
import MaturityScoreCard from "@/components/MaturityScoreCard";
import PipelineIdeas from "@/components/PipelineIdeas";
import TodayDate from "@/components/TodayDate";

export default function DashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />

      {/* Main content */}
      <main
        style={{
          marginLeft: "var(--sidebar-w)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top header bar */}
        <header
          style={{
            padding: "20px 32px 18px",
            borderBottom: "1px solid var(--card-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(13,27,46,0.6)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#F1F5F9", lineHeight: 1 }}>
              Command Center
            </h1>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              <TodayDate />
            </p>
          </div>

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
        </header>

        {/* Page body */}
        <div style={{ padding: "28px 32px", flex: 1, display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Section 1: KPI Cards */}
          <section>
            <KPIGrid />
          </section>

          {/* Section 2: Service Health + Activity Feed */}
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

          {/* Section 3: Automation Trend + Maturity Score */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <AutomationTrendChart />
            <MaturityScoreCard />
          </section>

          {/* Section 4: Pipeline Ideas */}
          <section>
            <PipelineIdeas />
          </section>
        </div>

        {/* Footer */}
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
      </main>
    </div>
  );
}
