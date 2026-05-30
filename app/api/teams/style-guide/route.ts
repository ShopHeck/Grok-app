import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canEditTeamSettings, TeamRole } from "@/lib/teams";
import { z } from "zod";

const StyleGuideSchema = z.object({
  teamId: z.string().uuid(),
  styleGuide: z.object({
    voice_tone: z.string().max(500),
    dos: z.array(z.string().max(200)).max(10),
    donts: z.array(z.string().max(200)).max(10),
    custom_rubric_weights: z.record(z.number().min(0).max(1)).nullable(),
    brand_terms: z.array(z.object({
      correct: z.string().max(50),
      incorrect: z.array(z.string().max(50)),
    })).max(20),
  }),
});

/**
 * GET /api/teams/style-guide?teamId=xxx - Get team style guide
 * PUT /api/teams/style-guide - Update team style guide
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = request.nextUrl.searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Verify membership
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
  }

  const { data: team } = await supabase
    .from("teams")
    .select("style_guide")
    .eq("id", teamId)
    .single();

  return NextResponse.json({ styleGuide: team?.style_guide || null });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = StyleGuideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { teamId, styleGuide } = parsed.data;

  // Verify caller can edit settings
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership || !canEditTeamSettings(membership.role as TeamRole)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { error } = await supabase
    .from("teams")
    .update({ style_guide: styleGuide })
    .eq("id", teamId);

  if (error) {
    return NextResponse.json({ error: "Failed to update style guide" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
