"use client";

import { AlertTriangle, CheckCircle, Zap, Shield, Info } from "lucide-react";
import type { ActivityEvent } from "@/types";
import { activityEvents } from "@/data/mock";

const eventConfig: Record<
  ActivityEvent["type"],
  { icon: React.ReactNode; color: string; bg: string }
> = {
  escalation: {
    icon: <AlertTriangle size={14} />,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
  resolution: {
    icon: <CheckCircle size={14} />,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
  },
  automation: {
    icon: <Zap size={14} />,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.12)",
  },
  breach: {
    icon: <Shield size={14} />,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
  },
  info: {
    icon: <Info size={14} />,
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.1)",
  },
};

function EventRow({ event }: { event: ActivityEvent }) {
  const config = eventConfig[event.type];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid rgba(26,47,78,0.6)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "8px",
          background: config.bg,
          border: `1px solid ${config.color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: config.color,
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "12.5px",
            color: "#CBD5E1",
            lineHeight: 1.5,
            marginBottom: "4px",
          }}
        >
          {event.message}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#475569",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "140px",
            }}
          >
            {event.service}
          </span>
          <span style={{ fontSize: "11px", color: "#334155", flexShrink: 0 }}>{event.time}</span>
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "4px",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>Live Activity</h2>
          <div style={{ position: "relative", width: "8px", height: "8px" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "var(--green)",
                opacity: 0.4,
                animation: "pingAnim 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "1px",
                borderRadius: "50%",
                background: "var(--green)",
              }}
            />
          </div>
        </div>
        <span style={{ fontSize: "11px", color: "#475569" }}>{activityEvents.length} events</span>
      </div>

      {/* Feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginRight: "-4px",
          paddingRight: "4px",
        }}
      >
        {activityEvents.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>

      <style>{`
        @keyframes pingAnim {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
