"use client";

import type { ServiceProduct } from "@/types";
import { services } from "@/data/mock";
import { getStatusColor, getStatusBg } from "@/lib/utils";

function RiskBadge({ risk }: { risk: ServiceProduct["riskProfile"] }) {
  const colors: Record<ServiceProduct["riskProfile"], string> = {
    Low: "#22C55E",
    Medium: "#F59E0B",
    High: "#EF4444",
    Critical: "#A855F7",
  };
  const bgs: Record<ServiceProduct["riskProfile"], string> = {
    Low: "rgba(34,197,94,0.1)",
    Medium: "rgba(245,158,11,0.1)",
    High: "rgba(239,68,68,0.1)",
    Critical: "rgba(168,85,247,0.1)",
  };
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 600,
        color: colors[risk],
        background: bgs[risk],
        padding: "2px 7px",
        borderRadius: "20px",
        letterSpacing: "0.3px",
      }}
    >
      {risk} Risk
    </span>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "8px",
        padding: "6px 10px",
        flex: 1,
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>{value}</span>
      <span style={{ fontSize: "10px", color: "#64748B", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function ServiceCard({ svc }: { svc: ServiceProduct }) {
  const statusColor = getStatusColor(svc.status);
  const statusBg = getStatusBg(svc.status);

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${statusColor}40, 0 4px 24px rgba(0,0,0,0.3)`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${statusColor}60`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--card-border)";
      }}
    >
      {/* Colored bottom border accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: statusColor,
          opacity: 0.7,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>{svc.emoji}</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#F1F5F9", lineHeight: 1.3 }}>
              {svc.name}
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
              {svc.owner} · {svc.ownerTitle}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: statusBg,
            border: `1px solid ${statusColor}30`,
            padding: "4px 9px",
            borderRadius: "20px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: statusColor,
              textTransform: "capitalize",
            }}
          >
            {svc.status.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.5, marginTop: "-4px" }}>
        {svc.description}
      </p>

      {/* Metrics */}
      <div style={{ display: "flex", gap: "8px" }}>
        <MetricPill label="Automation" value={`${svc.automationPct}%`} />
        <MetricPill label="Cost/ticket" value={`$${svc.costPerTicket}`} />
        <MetricPill label="FTR" value={`${svc.ftrPct}%`} />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <RiskBadge risk={svc.riskProfile} />
        <span style={{ fontSize: "11px", color: "#475569" }}>{svc.tierRange}</span>
      </div>
    </div>
  );
}

export default function ServiceHealthGrid() {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>
          Service Health Monitor
        </h2>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
          {services.length} active services tracked
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "14px",
        }}
      >
        {services.map((svc) => (
          <ServiceCard key={svc.id} svc={svc} />
        ))}
      </div>
    </div>
  );
}
