"use client";

import type { CaseAsset } from "@/types";
import { CHARGE_STATUS_LABELS, ASSET_STATUS_LABELS } from "@/lib/soa/constants";
import { formatGBP } from "@/lib/soa/format";

export default function AssetsGrid({ assets }: { assets: CaseAsset[] }) {
  const alive = assets.filter((a) => !a.deleted_at);
  if (alive.length === 0) {
    return <p style={{ color: "#94A3B8", fontSize: "13px" }}>No assets recorded.</p>;
  }

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--card-border)", color: "#64748B", textAlign: "left" }}>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Description</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Type</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Charge</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Book Value</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>ETR</th>
            <th style={{ padding: "10px 12px", fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {alive.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid rgba(26,47,78,0.4)", color: "#CBD5E1" }}>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ fontWeight: 500 }}>{a.description ?? "—"}</div>
                {a.charge_holder_name && (
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                    Holder: {a.charge_holder_name}
                  </div>
                )}
              </td>
              <td style={{ padding: "10px 12px" }}>{a.asset_type ?? "—"}</td>
              <td style={{ padding: "10px 12px" }}>
                {a.charge_status ? CHARGE_STATUS_LABELS[a.charge_status] : "—"}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatGBP(a.book_value)}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatGBP(a.etr)}
                {a.etr_uncertain && (
                  <span style={{ color: "var(--amber)", marginLeft: "4px" }} title="ETR uncertain">⚠</span>
                )}
              </td>
              <td style={{ padding: "10px 12px" }}>
                {a.status ? ASSET_STATUS_LABELS[a.status] : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
