"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  GitBranch,
  Activity,
  Map,
  FileText,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { label: "Services", href: "/services", icon: <Server size={18} /> },
  { label: "Pipeline Ideas", href: "/pipeline", icon: <GitBranch size={18} /> },
  { label: "Activity", href: "/activity", icon: <Activity size={18} /> },
  { label: "Roadmap", href: "/roadmap", icon: <Map size={18} /> },
  // SoA tab — last position per HH 2026-05-07. Stage C will replace the
  // placeholder page with the case picker + bidirectional sync to Hudson One.
  { label: "Statement of Affairs", href: "/soa", icon: <FileText size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

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
      <nav style={{ padding: "12px 12px", flex: 1 }} aria-label="Primary">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                background: isActive ? "rgba(6, 182, 212, 0.08)" : "transparent",
                color: isActive ? "var(--cyan)" : "#94A3B8",
                fontSize: "13.5px",
                fontWeight: isActive ? 600 : 400,
                textDecoration: "none",
                marginBottom: "2px",
                borderLeft: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              <span style={{ color: isActive ? "var(--cyan)" : "#64748B", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
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
          <div className="kv-pulse-dot" aria-hidden />
          <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 500 }}>
            System Online
          </span>
        </div>
        <span style={{ fontSize: "11px", color: "#475569" }}>v0.1.0</span>
      </div>
    </aside>
  );
}
