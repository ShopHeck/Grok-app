import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateTeamSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/),
});

/**
 * GET /api/teams - List teams the user belongs to
 * POST /api/teams - Create a new team (requires team plan)
 */

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get teams user is a member of
  const { data: memberships } = await supabase
    .from("team_members")
    .select(`
      role,
      team:teams (
        id, name, slug, owner_id, plan, max_seats, created_at
      )
    `)
    .eq("user_id", user.id);

  const teams = (memberships || []).map((m) => ({
    ...m.team,
    role: m.role,
  }));

  return NextResponse.json({ teams });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user has team plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status !== "team") {
    return NextResponse.json(
      { error: "Team plan required to create a team workspace" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, slug } = parsed.data;

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Team slug already taken" }, { status: 409 });
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      name,
      slug,
      owner_id: user.id,
      plan: "team",
      max_seats: 10,
    })
    .select()
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }

  // Add creator as owner
  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
  });

  return NextResponse.json({ team }, { status: 201 });
}
