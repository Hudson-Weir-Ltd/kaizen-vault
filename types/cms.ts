/**
 * Content / playbook / assessment / roadmap types.
 *
 * Currently unused by the UI but reserved for future tabs (Knowledge Base,
 * Maturity Assessment, Roadmap planner).
 */

import type { TierLabel } from "./dashboard";

export type ContentType = "Template" | "Playbook" | "Guide" | "Framework";
export type PhaseStatus = "COMPLETE" | "ACTIVE" | "PENDING";

export interface TierData {
  tier: string;
  volume: number;
  label: string;
  color: string;
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

export type AssessmentAnswers = Record<string, number>;

export interface LayerScore {
  layer: number;
  title: string;
  score: number;
  maxScore: number;
  pct: number;
}
