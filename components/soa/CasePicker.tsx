"use client";

import Link from "next/link";
import { useCases } from "@/lib/soa/hooks";

export default function CasePicker() {
  const { data, isLoading, error } = useCases();

  if (isLoading) {
    return (
      <p style={{ color: "#94A3B8", fontSize: "13px" }}>Loading cases from bridge…</p>
    );
  }

  if (error) {
    return (
      <p style={{ color: "var(--red)", fontSize: "13px" }}>
        Bridge error: {error instanceof Error ? error.message : "unknown"}
      </p>
    );
  }

  const cases = data?.cases ?? [];

  if (cases.length === 0) {
    return (
      <p style={{ color: "#94A3B8", fontSize: "13px" }}>
        You don&apos;t have access to any Hudson One cases yet.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
      {cases.map((c) => (
        <Link
          key={c.id}
          href={`/soa/${c.id}`}
          style={{
            display: "block",
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            padding: "20px",
            textDecoration: "none",
            color: "#F1F5F9",
            transition: "border-color 0.15s ease, transform 0.15s ease",
          }}
          className="kv-case-card"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "1px", marginBottom: "4px" }}>
                {c.caseNumber} · {c.procedure}
              </p>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#F1F5F9" }}>{c.companyName}</h3>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B" }}>
            <span>Appointed {c.appointmentDate}</span>
            <span>{c.ip}</span>
          </div>
        </Link>
      ))}
      {data?.source === "mock" && (
        <p
          style={{
            gridColumn: "1 / -1",
            fontSize: "11px",
            color: "#475569",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          ⓘ Cases are stubbed mock data. Stage C-2 will replace with the real Hudson One bridge.
        </p>
      )}
    </div>
  );
}
