import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MaturityLevel, Status } from "@/types";

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
