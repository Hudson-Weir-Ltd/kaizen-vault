"use client";

import dynamic from "next/dynamic";

/**
 * Client-side lazy wrapper for AutomationTrendChart.
 *
 * Why split this out?
 *   1. `next/dynamic` with `{ ssr: false }` can only be used inside Client
 *      Components in Next 15 — server components can't opt out of SSR.
 *   2. Recharts is ~120 KB gzipped and not needed before paint, so we delay
 *      loading until after the dashboard server component has streamed.
 */
const AutomationTrendChart = dynamic(
  () => import("./AutomationTrendChart"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "20px",
          height: "316px",
        }}
        aria-label="Loading automation trend"
      />
    ),
  }
);

export default function AutomationTrendChartLazy() {
  return <AutomationTrendChart />;
}
