import { getMaturityLevel, getMaturityColor } from "@/lib/utils";
import { services } from "@/data/mock";

function computeOverallScore(): number {
  const totalAuto = services.reduce((acc, s) => acc + s.automationPct, 0);
  const avgAuto = totalAuto / services.length;
  const totalFtr = services.reduce((acc, s) => acc + s.ftrPct, 0);
  const avgFtr = totalFtr / services.length;
  return Math.round((avgAuto * 0.5 + avgFtr * 0.5));
}

const dimensions = [
  { label: "Governance", pct: 72 },
  { label: "Automation", pct: 68 },
  { label: "Analytics", pct: 55 },
  { label: "Compliance", pct: 80 },
  { label: "Experience", pct: 63 },
];

export default function MaturityScoreCard() {
  const score = computeOverallScore();
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
            {/* Track */}
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Progress */}
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
          {/* Center label */}
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
