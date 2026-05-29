import { AgentConfig } from "./types";
import { coldEmailGrader } from "./cold-email-grader";
import { listingOptimizer } from "./listing-optimizer";
import { contractReviewer } from "./contract-reviewer";
import { jobPostAnalyzer } from "./job-post-analyzer";
import { socialPostOptimizer } from "./social-post-optimizer";
import { resumeReviewer } from "./resume-reviewer";
import { adCopyGrader } from "./ad-copy-grader";
import { landingPageReviewer } from "./landing-page-reviewer";
import { customAgent } from "./custom-agent";

export * from "./types";

// All available agents
export const agents: AgentConfig[] = [
  coldEmailGrader,
  socialPostOptimizer,
  listingOptimizer,
  resumeReviewer,
  adCopyGrader,
  landingPageReviewer,
  contractReviewer,
  jobPostAnalyzer,
  customAgent,
];

// Map for quick lookup by ID
export const agentMap: Record<string, AgentConfig> = Object.fromEntries(
  agents.map((agent) => [agent.id, agent])
);

// Get agent by ID (throws if not found)
export function getAgent(agentId: string): AgentConfig {
  const agent = agentMap[agentId];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  return agent;
}

// Get agents available for a given plan tier
export function getAgentsForPlan(plan: string): AgentConfig[] {
  const tierOrder = { free: 0, pro: 1, team: 2 };
  const userTier = tierOrder[plan as keyof typeof tierOrder] ?? 0;

  return agents.filter((agent) => {
    const agentTier = tierOrder[agent.tier as keyof typeof tierOrder] ?? 0;
    return agentTier <= userTier;
  });
}

// Check if a user's plan can access a specific agent
export function canAccessAgent(plan: string, agentId: string): boolean {
  const agent = agentMap[agentId];
  if (!agent) return false;

  const tierOrder = { free: 0, pro: 1, team: 2 };
  const userTier = tierOrder[plan as keyof typeof tierOrder] ?? 0;
  const agentTier = tierOrder[agent.tier as keyof typeof tierOrder] ?? 0;

  return userTier >= agentTier;
}

// Agent IDs grouped by category
export const agentsByCategory = agents.reduce(
  (acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = [];
    acc[agent.category].push(agent);
    return acc;
  },
  {} as Record<string, AgentConfig[]>
);

// All valid agent IDs (for validation)
export const validAgentIds = agents.map((a) => a.id);
