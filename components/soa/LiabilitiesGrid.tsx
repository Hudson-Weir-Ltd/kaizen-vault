"use client";

import type { CaseLiability } from "@/types";
import { CREDITOR_CATEGORY_LABELS } from "@/lib/soa/constants";
import { formatGBP } from "@/lib/soa/format";

export default function LiabilitiesGrid({ liabilities }: { liabilities: CaseLiability[] }) {
  const alive = liabilities.filter((l) => !l.deleted_at);
  if (alive.length === 0) {
    return <p style={{ color: "#94A3B8", fontSize: "13px" }}>No liabilities recorded.</p>;
  }

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--card-border)", color: "#64748B", textAlign: "left" }}>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Creditor</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Category</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Type</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Amount</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "center" }}>Proof</th>
          </tr>
        </thead>
        <tbody>
          {alive.map((l) => (
            <tr key={l.id} style={{ borderBottom: "1px solid rgba(26,47,78,0.4)", color: "#CBD5E1" }}>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ fontWeight: 500 }}>{l.creditor_name ?? "—"}</div>
                {l.reference_number && (
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                    Ref: {l.reference_number}
                  </div>
                )}
              </td>
              <td style={{ padding: "10px 12px" }}>
                {l.category ? CREDITOR_CATEGORY_LABELS[l.category] : "—"}
              </td>
              <td style={{ padding: "10px 12px" }}>{l.creditor_type ?? "—"}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatGBP(l.soa_amount ?? l.amount)}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                {l.proof_received ? (
                  <span style={{ color: "var(--green)", fontWeight: 600 }} title="Proof received">✓</span>
                ) : (
                  <span style={{ color: "#475569" }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
