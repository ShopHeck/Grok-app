import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { canManageTeam, TeamRole } from "@/lib/teams";

const InviteMemberSchema = z.object({
  teamId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});

const UpdateMemberSchema = z.object({
  teamId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]),
});

const RemoveMemberSchema = z.object({
  teamId: z.string().uuid(),
  memberId: z.string().uuid(),
});

/**
 * GET /api/teams/members?teamId=xxx - List team members
 * POST /api/teams/members - Invite a new member
 * PATCH /api/teams/members - Update member role
 * DELETE /api/teams/members - Remove a member
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = request.nextUrl.searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Verify user is a team member
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
  }

  // Get all members
  const { data: members } = await supabase
    .from("team_members")
    .select(`
      id, role, joined_at,
      profile:profiles (id, email, display_name)
    `)
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });

  // Get pending invites
  const { data: invites } = await supabase
    .from("team_invites")
    .select("id, email, role, status, created_at, expires_at")
    .eq("team_id", teamId)
    .eq("status", "pending");

  return NextResponse.json({
    members: (members || []).map((m) => ({
      id: m.id,
      userId: (m.profile as unknown as Record<string, unknown>)?.id,
      email: (m.profile as unknown as Record<string, unknown>)?.email,
      displayName: (m.profile as unknown as Record<string, unknown>)?.display_name,
      role: m.role,
      joinedAt: m.joined_at,
    })),
    invites: invites || [],
    currentUserRole: membership.role,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = InviteMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { teamId, email, role } = parsed.data;

  // Verify caller can manage members
  const { data: callerMembership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!callerMembership || !canManageTeam(callerMembership.role as TeamRole)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Check seat limit
  const { data: team } = await supabase
    .from("teams")
    .select("max_seats")
    .eq("id", teamId)
    .single();

  const { count: currentMembers } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (team && currentMembers && currentMembers >= team.max_seats) {
    return NextResponse.json({ error: "Seat limit reached. Upgrade to add more members." }, { status: 403 });
  }

  // Create invite
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString(); // 7 days

  const { data: invite, error } = await supabase
    .from("team_invites")
    .insert({
      team_id: teamId,
      email,
      role,
      invited_by: user.id,
      status: "pending",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  return NextResponse.json({ invite }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { teamId, memberId, role } = parsed.data;

  // Verify caller can manage
  const { data: callerMembership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!callerMembership || !canManageTeam(callerMembership.role as TeamRole)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Cannot change owner role
  const { data: targetMember } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", memberId)
    .single();

  if (targetMember?.role === "owner") {
    return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
  }

  await supabase
    .from("team_members")
    .update({ role })
    .eq("id", memberId);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RemoveMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { teamId, memberId } = parsed.data;

  // Verify caller can manage
  const { data: callerMembership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!callerMembership || !canManageTeam(callerMembership.role as TeamRole)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Cannot remove owner
  const { data: target } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", memberId)
    .single();

  if (target?.role === "owner") {
    return NextResponse.json({ error: "Cannot remove the team owner" }, { status: 400 });
  }

  await supabase.from("team_members").delete().eq("id", memberId);

  return NextResponse.json({ success: true });
}
