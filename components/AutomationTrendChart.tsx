"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { automationTrend } from "@/data/mock";

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: "#0D1B2E",
        border: "1px solid #1A2F4E",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "12px",
      }}
    >
      <p style={{ color: "#94A3B8", marginBottom: "8px", fontWeight: 600 }}>{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          style={{ display: "flex", justifyContent: "space-between", gap: "24px", marginBottom: "4px" }}
        >
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span style={{ color: "#E2E8F0", fontWeight: 700 }}>{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  stroke?: string;
}

function CustomDot({ cx, cy, stroke }: CustomDotProps) {
  if (cx === undefined || cy === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={stroke}
      stroke="#08101F"
      strokeWidth={2}
    />
  );
}

export default function AutomationTrendChart() {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F1F5F9" }}>
          Automation Performance
        </h2>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
          6-month trend vs. target
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={automationTrend}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(26,47,78,0.8)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#64748B", fontSize: 11 }}
            axisLine={{ stroke: "#1A2F4E" }}
            tickLine={false}
          />
          <YAxis
            domain={[40, 90]}
            tick={{ fill: "#64748B", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            formatter={(value: string) => (
              <span style={{ color: "#94A3B8" }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="automationPct"
            name="Automation %"
            stroke="#06B6D4"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#06B6D4", stroke: "#08101F", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="targetPct"
            name="Target %"
            stroke="#A855F7"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 5, fill: "#A855F7", stroke: "#08101F", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
