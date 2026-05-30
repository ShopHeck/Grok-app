/**
 * Team-related types and utilities for team workspaces.
 */

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: "team" | "enterprise";
  max_seats: number;
  style_guide: TeamStyleGuide | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  email: string;
  display_name: string | null;
  joined_at: string;
}

export interface TeamStyleGuide {
  voice_tone: string;
  dos: string[];
  donts: string[];
  custom_rubric_weights: Record<string, number> | null;
  brand_terms: { correct: string; incorrect: string[] }[];
}

export interface TeamAnalytics {
  totalAnalyses: number;
  avgScore: number;
  scoreChange: number;
  topAgents: { agentId: string; count: number; avgScore: number }[];
  memberStats: { userId: string; name: string; count: number; avgScore: number }[];
  weeklyTrend: { week: string; count: number; avgScore: number }[];
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "pending" | "accepted" | "expired";
  invited_by: string;
  created_at: string;
  expires_at: string;
}

export const TEAM_ROLES = {
  owner: { label: "Owner", canManageMembers: true, canEditSettings: true, canAnalyze: true, canView: true },
  admin: { label: "Admin", canManageMembers: true, canEditSettings: true, canAnalyze: true, canView: true },
  member: { label: "Member", canManageMembers: false, canEditSettings: false, canAnalyze: true, canView: true },
  viewer: { label: "Viewer", canManageMembers: false, canEditSettings: false, canAnalyze: false, canView: true },
} as const;

export type TeamRole = keyof typeof TEAM_ROLES;

export function canManageTeam(role: TeamRole): boolean {
  return TEAM_ROLES[role].canManageMembers;
}

export function canEditTeamSettings(role: TeamRole): boolean {
  return TEAM_ROLES[role].canEditSettings;
}

export function canAnalyzeInTeam(role: TeamRole): boolean {
  return TEAM_ROLES[role].canAnalyze;
}

/** Per-seat pricing */
export const TEAM_SEAT_PRICE = 15; // $15/additional seat/month
export const TEAM_INCLUDED_SEATS = 3; // First 3 seats included in team plan
