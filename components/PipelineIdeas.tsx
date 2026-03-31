import { CheckCircle2 } from "lucide-react";
import type { PipelineIdea } from "@/data/mock";
import { pipelineIdeas } from "@/data/mock";

const statusConfig: Record<
  PipelineIdea["status"],
  { color: string; bg: string; border: string }
> = {
  Proposed: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  "In Design": {
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
  },
  "Ready to Build": {
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
  },
};

function StatusBadge({ status }: { status: PipelineIdea["status"] }) {
  const cfg = statusConfig[status];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: "3px 10px",
        borderRadius: "20px",
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
        padding: "8px 12px",
        textAlign: "center",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#E2E8F0",
          marginBottom: "3px",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "10px", color: "#64748B", lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function PipelineCard({ idea }: { idea: PipelineIdea }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Colored left border accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "3px",
          background: idea.accentColor,
          borderRadius: "14px 0 0 14px",
        }}
      />

      {/* Top gradient strip */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, ${idea.accentColor}CC, transparent)`,
          marginLeft: "3px",
        }}
      />

      <div style={{ padding: "20px 20px 20px 23px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "24px",
                lineHeight: 1,
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))",
              }}
            >
              {idea.icon}
            </span>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#F1F5F9", lineHeight: 1.3 }}>
                {idea.title}
              </h3>
              <p style={{ fontSize: "11.5px", color: idea.accentColor, marginTop: "2px", fontWeight: 500 }}>
                {idea.tagline}
              </p>
            </div>
          </div>
          <StatusBadge status={idea.status} />
        </div>

        {/* Description */}
        <p style={{ fontSize: "12.5px", color: "#94A3B8", lineHeight: 1.6 }}>
          {idea.description}
        </p>

        {/* Capabilities */}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "8px",
            }}
          >
            Capabilities
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "5px", listStyle: "none" }}>
            {idea.capabilities.map((cap, i) => (
              <li
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: "#CBD5E1" }}
              >
                <CheckCircle2
                  size={13}
                  style={{ color: "#06B6D4", flexShrink: 0, marginTop: "1px" }}
                />
                {cap}
              </li>
            ))}
          </ul>
        </div>

        {/* Impact */}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "8px",
            }}
          >
            Projected Impact
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {idea.impact.map((imp, i) => (
              <ImpactStat key={i} label={imp.label} value={imp.value} />
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "8px",
            }}
          >
            Connects With
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {idea.integrations.map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  color: "#94A3B8",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "3px 9px",
                  borderRadius: "20px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PipelineIdeas() {
  const proposed = pipelineIdeas.filter((p) => p.status === "Proposed").length;
  const inDesign = pipelineIdeas.filter((p) => p.status === "In Design").length;
  const readyToBuild = pipelineIdeas.filter((p) => p.status === "Ready to Build").length;

  return (
    <section>
      {/* Section Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F1F5F9" }}>
            Pipeline Ideas
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "#64748B",
              background: "rgba(255,255,255,0.05)",
              padding: "2px 8px",
              borderRadius: "20px",
              border: "1px solid var(--card-border)",
            }}
          >
            5 concepts identified
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, maxWidth: "680px" }}>
          AI-powered automation pipelines proposed to eliminate manual bottlenecks, reduce cost leakage, and
          accelerate service maturity across every HR function. Each concept is mapped to existing platform
          modules for rapid integration.
        </p>

        {/* Status summary */}
        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          {[
            { label: "Proposed", count: proposed, color: "#F59E0B" },
            { label: "In Design", count: inDesign, color: "#A855F7" },
            { label: "Ready to Build", count: readyToBuild, color: "#06B6D4" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: s.color,
                }}
              />
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.count}</span> {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {pipelineIdeas.map((idea) => (
          <PipelineCard key={idea.id} idea={idea} />
        ))}
      </div>
    </section>
  );
}
