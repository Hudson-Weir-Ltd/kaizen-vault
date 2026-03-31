"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Server,
  GitBranch,
  Activity,
  Map,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "services", label: "Services", icon: <Server size={18} /> },
  { id: "pipeline", label: "Pipeline Ideas", icon: <GitBranch size={18} /> },
  { id: "activity", label: "Activity", icon: <Activity size={18} /> },
  { id: "roadmap", label: "Roadmap", icon: <Map size={18} /> },
];

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        background: "var(--card)",
        borderRight: "1px solid var(--card-border)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, var(--cyan), var(--purple))",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#F1F5F9",
              letterSpacing: "-0.3px",
            }}
          >
            Kaizen OS
          </span>
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "#64748B",
            marginLeft: "42px",
            letterSpacing: "0.4px",
          }}
        >
          HR Service Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "none",
                background: isActive ? "rgba(6, 182, 212, 0.08)" : "transparent",
                color: isActive ? "var(--cyan)" : "#94A3B8",
                fontSize: "13.5px",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                marginBottom: "2px",
                textAlign: "left",
                borderLeft: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ color: isActive ? "var(--cyan)" : "#64748B", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--card-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--green)",
              boxShadow: "0 0 6px var(--green)",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 500 }}>
            System Online
          </span>
        </div>
        <span style={{ fontSize: "11px", color: "#475569" }}>v0.1.0</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </aside>
  );
}
