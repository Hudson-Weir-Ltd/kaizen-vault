/**
 * Dashboard domain types — KPIs, services, activity, charts, pipeline ideas.
 * Imported by components/* and data/mock.ts.
 */

export type Status = "healthy" | "at-risk" | "critical";
export type TierLabel = "Free" | "Starter" | "Pro" | "Enterprise";

export type MaturityLevel =
  | "Foundational"
  | "Developing"
  | "Established"
  | "Advanced"
  | "Optimized";

/**
 * Whether moving the metric value up (vs. target) is good or bad.
 * Used by the KPI progress-bar to colour and clamp correctly.
 */
export type Direction = "higher_is_better" | "lower_is_better";

export interface KPICard {
  id: string;
  label: string;
  value: string;
  target: string;
  trend: "up" | "down";
  trendGood: boolean;
  delta: string;
  /** Defaults to "higher_is_better" when omitted (back-compat). */
  direction?: Direction;
}

export interface ServiceProduct {
  id: string;
  name: string;
  emoji: string;
  owner: string;
  ownerTitle: string;
  status: Status;
  automationPct: number;
  volumePerMonth: number;
  costPerTicket: number;
  ftrPct: number;
  riskProfile: "Low" | "Medium" | "High" | "Critical";
  tierRange: string;
  description: string;
}

export interface ActivityEvent {
  id: string;
  type: "escalation" | "resolution" | "automation" | "breach" | "info";
  message: string;
  service: string;
  time: string;
  severity: "high" | "medium" | "low" | "info";
}

export interface AutomationTrendPoint {
  month: string;
  automationPct: number;
  targetPct: number;
  costPerTicket: number;
}

export interface PipelineImpactStat {
  label: string;
  value: string;
}

export interface PipelineIdea {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  description: string;
  capabilities: string[];
  impact: PipelineImpactStat[];
  integrations: string[];
  status: "Proposed" | "In Design" | "Ready to Build";
  accentColor: string;
}
