import type { ReactNode } from "react";

/**
 * Shared sticky page header (title + subtitle + optional right-rail content).
 * Used by all (dashboard) pages so spacing/colour stay consistent.
 */
export default function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
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
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}
