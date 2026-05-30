export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "writing" | "business" | "legal" | "custom";
  tier: "free" | "pro" | "team";
  placeholder: string;
  inputLabel: string;
  maxInputLength: number;
  systemPrompt: string;
  outputSchema: OutputField[];
  scoringRubric: ScoringCriteria[];
  exampleInput?: string;
}

export interface OutputField {
  key: string;
  label: string;
  type: "score" | "text" | "list" | "flags" | "rewrite" | "sections";
  description: string;
}

export interface ScoringCriteria {
  name: string;
  weight: number;
  description: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  details: Record<string, unknown>;
  suggestions: string[];
  rewrite?: string;
  flags?: Flag[];
}

export interface Flag {
  severity: "info" | "warning" | "critical";
  message: string;
  context?: string;
}

export interface UsageQuota {
  agentId: string;
  analysisCount: number;
  tokensUsed: number;
}

export interface PlanLimits {
  maxAnalysesPerMonth: number;
  maxAgents: string[];
  maxInputLength: number;
  historyRetentionDays: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxAnalysesPerMonth: 10,
    maxAgents: ["cold-email-grader", "listing-optimizer", "newsletter-grader", "support-response-grader", "custom"],
    maxInputLength: 5000,
    historyRetentionDays: 7,
    features: ["5 agents", "10 analyses/month", "7-day history", "Chrome extension (3/week)", "Writing streaks", "Community templates", "Before/After comparison", "Industry benchmarks", "Marketplace (free agents)"],
  },
  pro: {
    maxAnalysesPerMonth: -1, // unlimited
    maxAgents: ["all"],
    maxInputLength: 50000,
    historyRetentionDays: -1, // unlimited
    features: [
      "All 15+ agents",
      "Unlimited analyses",
      "Full history",
      "Unlimited Chrome extension",
      "Writing DNA (personal AI tuning)",
      "Score badges & sharing",
      "Template marketplace",
      "Playbook workflows",
      "Publish marketplace agents",
      "Priority processing",
      "Export results",
    ],
  },
  team: {
    maxAnalysesPerMonth: -1,
    maxAgents: ["all"],
    maxInputLength: 100000,
    historyRetentionDays: -1,
    features: [
      "Everything in Pro",
      "Team workspace & analytics",
      "Slack integration",
      "Public API (/v1/analyze)",
      "1,000 API calls/month",
      "Webhook callbacks",
      "Shared history & style guide",
      "Custom agents",
      "White-label marketplace agents",
      "Weekly digest reports",
    ],
  },
};
