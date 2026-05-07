"use client";

import type { CaseAsset, CaseCharge, CaseLiability } from "@/types";
import { computeWaterfall } from "@/lib/soa/waterfall";
import { CREDITOR_CATEGORY_LABELS } from "@/lib/soa/constants";
import { formatGBP, formatGBPSigned } from "@/lib/soa/format";
import { useMemo } from "react";

interface Props {
  assets: CaseAsset[];
  liabilities: CaseLiability[];
  charges: CaseCharge[];
  /** "panel" = compact summary (right rail). "full" = printable document. */
  variant?: "panel" | "full";
}

export default function SoaPreview({ assets, liabilities, charges, variant = "panel" }: Props) {
  const result = useMemo(
    () => computeWaterfall({ assets, liabilities, charges }),
    [assets, liabilities, charges]
  );

  const compact = variant === "panel";

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: compact ? "16px" : "32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontSize: compact ? "12px" : "13px",
        color: "#CBD5E1",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: compact ? "13px" : "16px",
            fontWeight: 700,
            color: "#F1F5F9",
            marginBottom: "2px",
          }}
        >
          Statement of Affairs — Preview
        </h3>
        <p style={{ fontSize: compact ? "10px" : "12px", color: "#64748B" }}>
          Live waterfall (IA 1986 s.107 / s.175 / s.176A)
        </p>
      </div>

      {/* Charges block */}
      <Section title="Realisations by charge" compact={compact}>
        {result.charges.map((c, i) => (
          <Row
            key={c.chargeId ?? `bucket-${i}`}
            label={`${c.chargeHolderName ?? c.chargeType.replace("_", " ")} (${c.chargeType.replace("_", " ")})`}
            sub={`${c.assetCount} asset(s) · debt ${formatGBP(c.securedDebt)}`}
            value={formatGBP(c.totalRealisation)}
            secondary={c.surplus < 0 ? `shortfall ${formatGBPSigned(c.surplus)}` : undefined}
          />
        ))}
      </Section>

      {/* Prescribed part */}
      <Section title="Prescribed part (IA 1986 s.176A)" compact={compact}>
        <Row label="Net floating realisations" value={formatGBP(result.prescribedPart.netFloatingRealisations)} />
        <Row
          label="Slice to non-pref unsecured"
          value={formatGBP(result.prescribedPart.prescribedPart)}
          secondary={result.prescribedPart.capped ? "capped at £800,000" : undefined}
        />
        <Row label="Remainder to floating charge holder" value={formatGBP(result.prescribedPart.floatingChargeRemainder)} />
      </Section>

      {/* Estimated payouts */}
      <Section title="Estimated outcome by class" compact={compact}>
        {(Object.keys(result.claims) as Array<keyof typeof result.claims>).map((k) => {
          const claim = result.claims[k];
          const pay = result.estimatedPayouts[k];
          if (claim === 0) return null;
          const pct = claim > 0 ? Math.round((pay / claim) * 100) : 0;
          return (
            <Row
              key={k}
              label={CREDITOR_CATEGORY_LABELS[k as keyof typeof CREDITOR_CATEGORY_LABELS] ?? k}
              sub={`Claim ${formatGBP(claim)}`}
              value={`${formatGBP(pay)} (${pct}p in £)`}
            />
          );
        })}
      </Section>

      {/* Headline numbers */}
      <div
        style={{
          marginTop: "8px",
          paddingTop: "12px",
          borderTop: "1px solid var(--card-border)",
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        <Headline label="Pool for unsecured" value={formatGBP(result.totalForUnsecured)} compact={compact} />
        <Headline label="Total unsecured claims" value={formatGBP(result.totalUnsec)} compact={compact} />
        <Headline
          label="Total deficiency"
          value={formatGBPSigned(-result.totalDeficiency)}
          tone={result.totalDeficiency > 0 ? "bad" : "neutral"}
          compact={compact}
        />
      </div>
    </div>
  );
}

function Section({ title, children, compact }: { title: string; children: React.ReactNode; compact: boolean }) {
  return (
    <div>
      <p
        style={{
          fontSize: compact ? "10px" : "11px",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          color: "#64748B",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>{children}</div>
    </div>
  );
}

function Row({
  label,
  sub,
  value,
  secondary,
}: {
  label: string;
  sub?: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#CBD5E1" }}>{label}</div>
        {sub && <div style={{ color: "#475569", fontSize: "10.5px" }}>{sub}</div>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        <div style={{ color: "#E2E8F0", fontWeight: 500 }}>{value}</div>
        {secondary && <div style={{ color: "var(--amber)", fontSize: "10.5px" }}>{secondary}</div>}
      </div>
    </div>
  );
}

function Headline({
  label,
  value,
  tone = "neutral",
  compact,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "bad" | "good";
  compact: boolean;
}) {
  const color = tone === "bad" ? "var(--red)" : tone === "good" ? "var(--green)" : "#F1F5F9";
  return (
    <div>
      <p style={{ fontSize: compact ? "10px" : "11px", color: "#64748B", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: compact ? "16px" : "20px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
    </div>
  );
}
