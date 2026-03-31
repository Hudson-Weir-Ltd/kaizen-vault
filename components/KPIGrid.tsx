import { TrendingUp, TrendingDown } from "lucide-react";
import type { KPICard } from "@/types";
import { kpiCards } from "@/data/mock";

function parseProgress(value: string, target: string): number | null {
  const cleanValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const cleanTarget = parseFloat(target.replace(/[^0-9.]/g, ""));
  if (isNaN(cleanValue) || isNaN(cleanTarget) || cleanTarget === 0) return null;
  return Math.min((cleanValue / cleanTarget) * 100, 120);
}

function KPICardItem({ card }: { card: KPICard }) {
  const isGood = card.trendGood;
  const trendColor = isGood ? "var(--green)" : "var(--red)";
  const trendBg = isGood ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)";
  const progress = parseProgress(card.value, card.target);

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Label row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, letterSpacing: "0.3px" }}>
          {card.label}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: 600,
            color: trendColor,
            background: trendBg,
            padding: "3px 7px",
            borderRadius: "20px",
          }}
        >
          {card.trend === "up" ? (
            <TrendingUp size={11} />
          ) : (
            <TrendingDown size={11} />
          )}
          {card.delta}
        </span>
      </div>

      {/* Value */}
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#F1F5F9", lineHeight: 1 }}>
        {card.value}
      </div>

      {/* Target + Progress */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#475569" }}>Target</span>
          <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500 }}>{card.target}</span>
        </div>
        {progress !== null && (
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.07)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(progress, 100)}%`,
                background: progress >= 100 ? "var(--green)" : "var(--cyan)",
                borderRadius: "2px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function KPIGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
      }}
    >
      {kpiCards.map((card) => (
        <KPICardItem key={card.id} card={card} />
      ))}
    </div>
  );
}
