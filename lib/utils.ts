import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Direction, MaturityLevel, Status } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: Status): string {
  switch (status) {
    case "healthy":
      return "var(--green)";
    case "at-risk":
      return "var(--amber)";
    case "critical":
      return "var(--red)";
  }
}

export function getStatusBg(status: Status): string {
  switch (status) {
    case "healthy":
      return "rgba(34,197,94,0.12)";
    case "at-risk":
      return "rgba(245,158,11,0.12)";
    case "critical":
      return "rgba(239,68,68,0.12)";
  }
}

export function getMaturityLevel(pct: number): MaturityLevel {
  if (pct < 20) return "Foundational";
  if (pct < 40) return "Developing";
  if (pct < 60) return "Established";
  if (pct < 80) return "Advanced";
  return "Optimized";
}

export function getMaturityColor(level: MaturityLevel): string {
  switch (level) {
    case "Foundational":
      return "var(--red)";
    case "Developing":
      return "var(--amber)";
    case "Established":
      return "#60A5FA";
    case "Advanced":
      return "var(--purple)";
    case "Optimized":
      return "var(--green)";
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/**
 * Direction-aware progress percentage for KPI bars.
 *
 * - "higher_is_better": value/target * 100, capped at 120.
 *   At target → 100. Above target → up to 120 (overachievement).
 * - "lower_is_better": target/value * 100, capped at 120.
 *   At target → 100. Below target → up to 120. Above target (worse) → < 100.
 *
 * Returns null if either input cannot be parsed as a number.
 *
 * Strips currency / percent / thousands separators so callers can pass
 * values like "$14.20", "12,847", "68%".
 */
export function parseProgress(
  value: string,
  target: string,
  direction: Direction = "higher_is_better"
): number | null {
  const cleanValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const cleanTarget = parseFloat(target.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(cleanValue) || Number.isNaN(cleanTarget)) return null;
  if (cleanTarget === 0 || cleanValue === 0) return null;

  const ratio =
    direction === "higher_is_better"
      ? (cleanValue / cleanTarget) * 100
      : (cleanTarget / cleanValue) * 100;

  return Math.min(ratio, 120);
}

/**
 * Format a Date in en-GB style. Used for the dashboard header.
 * Centralised so we don't accidentally drift to en-US elsewhere.
 */
export function formatDateGB(d: Date = new Date()): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
