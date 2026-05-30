import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/analyses/compare?id=<analysisId>
 * Returns all versions (iterations) of an analysis for before/after comparison.
 * Versions are linked via parent_id chain.
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analysisId = request.nextUrl.searchParams.get("id");
  if (!analysisId) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  // Get the target analysis
  const { data: target } = await supabase
    .from("analyses")
    .select("id, parent_id, agent_id, title, score, summary, input_text, result, created_at, status")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (!target) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  // Find the root (oldest ancestor)
  let rootId = target.parent_id || target.id;

  // Walk up to find root (max 10 levels)
  let current = target;
  for (let i = 0; i < 10 && current.parent_id; i++) {
    const { data: parent } = await supabase
      .from("analyses")
      .select("id, parent_id")
      .eq("id", current.parent_id)
      .eq("user_id", user.id)
      .single();

    if (!parent) break;
    rootId = parent.id;
    current = parent as typeof current;
  }

  // Get all versions in the chain (root + all descendants)
  const { data: versions } = await supabase
    .from("analyses")
    .select("id, parent_id, agent_id, title, score, summary, input_text, result, created_at, status")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .or(`id.eq.${rootId},parent_id.eq.${rootId}`)
    .order("created_at", { ascending: true });

  // Also get deeper descendants (children of children)
  const allIds = (versions || []).map((v) => v.id);
  let allVersions = [...(versions || [])];

  if (allIds.length > 0) {
    const { data: descendants } = await supabase
      .from("analyses")
      .select("id, parent_id, agent_id, title, score, summary, input_text, result, created_at, status")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .in("parent_id", allIds)
      .not("id", "in", `(${allIds.join(",")})`)
      .order("created_at", { ascending: true });

    if (descendants) {
      allVersions = [...allVersions, ...descendants];
    }
  }

  // Deduplicate and sort by date
  const uniqueMap = new Map(allVersions.map((v) => [v.id, v]));
  const sorted = Array.from(uniqueMap.values())
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Map to response format
  const result = sorted.map((v, i) => ({
    id: v.id,
    version: i + 1,
    score: v.score || 0,
    summary: v.summary || "",
    inputText: v.input_text || "",
    suggestions: (v.result as Record<string, unknown>)?.suggestions || [],
    rewrite: (v.result as Record<string, unknown>)?.rewrite || undefined,
    createdAt: v.created_at,
  }));

  return NextResponse.json({
    versions: result,
    agentId: target.agent_id,
    title: target.title,
    totalImprovement: result.length >= 2 ? result[result.length - 1].score - result[0].score : 0,
  });
}
