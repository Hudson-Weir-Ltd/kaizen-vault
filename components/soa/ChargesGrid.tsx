"use client";

import type { CaseCharge } from "@/types";
import { CHARGE_TYPE_LABELS } from "@/lib/soa/constants";
import { formatGBP } from "@/lib/soa/format";

export default function ChargesGrid({ charges }: { charges: CaseCharge[] }) {
  const alive = charges.filter((c) => !c.deleted_at);
  if (alive.length === 0) {
    return <p style={{ color: "#94A3B8", fontSize: "13px" }}>No charges recorded.</p>;
  }

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--card-border)", color: "#64748B", textAlign: "left" }}>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Charge Holder</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Type</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Agreement</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Amount</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Attached</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>CH Code</th>
          </tr>
        </thead>
        <tbody>
          {alive.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid rgba(26,47,78,0.4)", color: "#CBD5E1" }}>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ fontWeight: 500 }}>{c.charge_holder_name ?? "—"}</div>
                {c.description && (
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px", maxWidth: "320px" }}>
                    {c.description}
                  </div>
                )}
              </td>
              <td style={{ padding: "10px 12px" }}>{CHARGE_TYPE_LABELS[c.charge_type]}</td>
              <td style={{ padding: "10px 12px" }}>{c.agreement_date ?? "—"}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatGBP(c.charge_amount)}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right" }}>{c.attached_asset_ids.length}</td>
              <td style={{ padding: "10px 12px", color: "#64748B" }}>{c.ch_charge_code ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
