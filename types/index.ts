export type Status = "healthy" | "at-risk" | "critical";
export type TierLabel = "Free" | "Starter" | "Pro" | "Enterprise";
export type ContentType = "Template" | "Playbook" | "Guide" | "Framework";
export type PhaseStatus = "COMPLETE" | "ACTIVE" | "PENDING";
export type MaturityLevel =
  | "Foundational"
  | "Developing"
  | "Established"
  | "Advanced"
  | "Optimized";

export interface KPICard {
  id: string;
  label: string;
  value: string;
  target: string;
  trend: "up" | "down";
  trendGood: boolean;
  delta: string;
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

export interface TierData {
  tier: string;
  volume: number;
  label: string;
  color: string;
}

export interface ActivityEvent {
  id: string;
  type: "escalation" | "resolution" | "automation" | "breach" | "info";
  message: string;
  service: string;
  time: string;
  severity: "high" | "medium" | "low" | "info";
}

export interface RoadmapPhase {
  id: number;
  name: string;
  period: string;
  status: PhaseStatus;
  milestones: { label: string; done: boolean }[];
  kpiTargets: { label: string; value: string }[];
  description: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  tier: TierLabel;
  price: string;
  tags: string[];
  downloads: number;
  featured: boolean;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
}

export interface AssessmentSection {
  id: string;
  layer: number;
  title: string;
  icon: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentAnswers {
  [questionId: string]: number;
}

export interface LayerScore {
  layer: number;
  title: string;
  score: number;
  maxScore: number;
  pct: number;
}
