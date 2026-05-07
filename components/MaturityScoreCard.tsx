import { getMaturityLevel, getMaturityColor } from "@/lib/utils";
import { services } from "@/data/mock";
import type { ServiceProduct } from "@/types";

/**
 * Compute the five maturity dimensions from `services` data.
 *
 * - Automation: average of services[].automationPct.
 * - Compliance: average of services[].ftrPct (FTR is the closest signal we have).
 * - Experience: status-weighted (healthy 100 / at-risk 60 / critical 30).
 * - Governance: risk-weighted (Low 100 / Medium 70 / High 40 / Critical 10).
 * - Analytics: weighted average of automation + FTR (50/50). When real
 *   analytics signals land in Stage C we'll replace this with usage data.
 *
 * Returning all five from one function so the component stays a server
 * component — no hooks, no client JS.
 */
function computeDimensions(svcs: ServiceProduct[]): { label: string; pct: number }[] {
  if (svcs.length === 0) {
    return [
      { label: "Governance", pct: 0 },
      { label: "Automation", pct: 0 },
      { label: "Analytics", pct: 0 },
      { label: "Compliance", pct: 0 },
      { label: "Experience", pct: 0 },
    ];
  }

  const avg = (xs: number[]) =>
    Math.round(xs.reduce((acc, x) => acc + x, 0) / xs.length);

  const statusToPct: Record<ServiceProduct["status"], number> = {
    healthy: 100,
    "at-risk": 60,
    critical: 30,
  };
  const riskToPct: Record<ServiceProduct["riskProfile"], number> = {
    Low: 100,
    Medium: 70,
    High: 40,
    Critical: 10,
  };

  const automation = avg(svcs.map((s) => s.automationPct));
  const compliance = avg(svcs.map((s) => s.ftrPct));
  const experience = avg(svcs.map((s) => statusToPct[s.status]));
  const governance = avg(svcs.map((s) => riskToPct[s.riskProfile]));
  const analytics = Math.round((automation + compliance) / 2);

  return [
    { label: "Governance", pct: governance },
    { label: "Automation", pct: automation },
    { label: "Analytics", pct: analytics },
    { label: "Compliance", pct: compliance },
    { label: "Experience", pct: experience },
  ];
}

function computeOverallScore(dimensions: { pct: number }[]): number {
  if (dimensions.length === 0) return 0;
  return Math.round(
    dimensions.reduce((acc, d) => acc + d.pct, 0) / dimensions.length
  );
}

export default function MaturityScoreCard() {
  const dimensions = computeDimensions(services);
  const score = computeOverallScore(dimensions);
  const level = getMaturityLevel(score);
  const color = getMaturityColor(level);

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>Maturity Score</h2>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
          Overall platform rating
        </p>
      </div>

      {/* Radial score */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "130px", height: "130px" }}>
          <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.3s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
            }}
          >
            <span style={{ fontSize: "26px", fontWeight: 800, color: "#F1F5F9", lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: "10px", color: "#64748B", lineHeight: 1 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Level badge */}
      <div style={{ textAlign: "center", marginTop: "-6px" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            padding: "4px 14px",
            borderRadius: "20px",
          }}
        >
          {level}
        </span>
      </div>

      {/* Dimension bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {dimensions.map((dim) => {
          const dimLevel = getMaturityLevel(dim.pct);
          const dimColor = getMaturityColor(dimLevel);
          return (
            <div key={dim.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "3px",
                }}
              >
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>{dim.label}</span>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
                  {dim.pct}%
                </span>
              </div>
              <div
                style={{
                  height: "3px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${dim.pct}%`,
                    background: dimColor,
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
