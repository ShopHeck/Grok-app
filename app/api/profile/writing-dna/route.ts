import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MIN_ANALYSES_FOR_DNA, type WritingDNA, type VoiceProfile, type AgentPattern } from "@/lib/writing-dna";
import { agentMap } from "@/lib/agents";

/**
 * GET /api/profile/writing-dna — Get user's Writing DNA profile
 * PUT /api/profile/writing-dna — Update scoring preferences / industry
 * POST /api/profile/writing-dna — Force regenerate DNA from analysis history
 */

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if DNA exists in profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("writing_dna, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // DNA requires Pro+ plan
  if (profile.subscription_status === "free") {
    return NextResponse.json({
      error: "upgrade_required",
      message: "Writing DNA requires a Pro plan",
      minimumAnalyses: MIN_ANALYSES_FOR_DNA,
    }, { status: 403 });
  }

  // Check analysis count
  const { count } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  if ((count || 0) < MIN_ANALYSES_FOR_DNA) {
    return NextResponse.json({
      status: "building",
      message: `Run ${MIN_ANALYSES_FOR_DNA - (count || 0)} more analyses to unlock your Writing DNA`,
      currentCount: count || 0,
      requiredCount: MIN_ANALYSES_FOR_DNA,
      dna: null,
    });
  }

  // Return existing DNA or generate fresh
  if (profile.writing_dna) {
    return NextResponse.json({
      status: "ready",
      dna: profile.writing_dna,
      analysisCount: count,
    });
  }

  // Generate DNA from history
  const dna = await generateWritingDNA(user.id, supabase);

  // Save to profile
  await supabase
    .from("profiles")
    .update({ writing_dna: dna })
    .eq("id", user.id);

  return NextResponse.json({ status: "ready", dna, analysisCount: count });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { scoringPreferences?: Record<string, unknown>; industry?: Record<string, unknown> };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("writing_dna")
    .eq("id", user.id)
    .single();

  const currentDna = (profile?.writing_dna || {}) as Record<string, unknown>;

  if (body.scoringPreferences) {
    currentDna.scoringPreferences = body.scoringPreferences;
  }
  if (body.industry) {
    currentDna.industry = body.industry;
  }

  await supabase
    .from("profiles")
    .update({ writing_dna: currentDna })
    .eq("id", user.id);

  return NextResponse.json({ success: true, dna: currentDna });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dna = await generateWritingDNA(user.id, supabase);

  await supabase
    .from("profiles")
    .update({ writing_dna: dna })
    .eq("id", user.id);

  return NextResponse.json({ status: "regenerated", dna });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateWritingDNA(userId: string, supabase: any): Promise<WritingDNA> {
  // Fetch last 50 completed analyses with input text
  const { data: analyses } = await supabase
    .from("analyses")
    .select("input_text, agent_id, score, result, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("score", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const allTexts = (analyses || []).map((a: { input_text: string }) => a.input_text || "");
  const allScores = (analyses || []).map((a: { score: number }) => a.score as number);

  // === VOICE PROFILE ===
  const combinedText = allTexts.join(" ");
  const sentences = combinedText.split(/[.!?]+/).filter((s: string) => s.trim().length > 3);
  const words = combinedText.split(/\s+/).filter((w: string) => w.length > 0);
  const avgSentenceLength = sentences.length > 0 ? Math.round(words.length / sentences.length) : 15;

  // Formality detection heuristics
  const informalMarkers = (combinedText.match(/\b(hey|lol|gonna|wanna|btw|tbh|ngl|fyi)\b/gi) || []).length;
  const formalMarkers = (combinedText.match(/\b(therefore|furthermore|consequently|regarding|pursuant)\b/gi) || []).length;
  const totalMarkers = Math.max(informalMarkers + formalMarkers, 1);
  const formalityScore = Math.round((formalMarkers / totalMarkers) * 100);

  // Active voice ratio (heuristic: presence of "was/were + verb" = passive)
  const passiveCount = (combinedText.match(/\b(was|were|been|being)\s+\w+ed\b/gi) || []).length;
  const totalSentenceCount = Math.max(sentences.length, 1);
  const activeVoiceRatio = Math.max(0, 1 - (passiveCount / totalSentenceCount));

  // Emoji detection
  const emojiCount = (combinedText.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu) || []).length;
  const emojiUsage = emojiCount === 0 ? "never" : emojiCount < 3 ? "rare" : emojiCount < 10 ? "moderate" : "frequent";

  // Vocabulary level
  const avgWordLength = words.length > 0 ? words.reduce((sum: number, w: string) => sum + w.length, 0) / words.length : 5;
  const vocabularyLevel = avgWordLength > 6.5 ? "advanced" : avgWordLength > 5 ? "moderate" : "simple";

  // Tone detection
  let tone = "professional";
  if (formalityScore < 20) tone = "casual";
  else if (formalityScore < 40) tone = "conversational";
  else if (formalityScore > 70) tone = "academic";

  const voice: VoiceProfile = {
    tone,
    avgSentenceLength,
    vocabularyLevel,
    formalityScore,
    signaturePhrases: [], // Would need NLP for real extraction
    structurePreference: avgSentenceLength > 20 ? "long-form" : "concise",
    emojiUsage,
    activeVoiceRatio: Math.round(activeVoiceRatio * 100) / 100,
  };

  // === AGENT PATTERNS ===
  const agentPatterns: Record<string, AgentPattern> = {};
  const agentGroups: Record<string, { scores: number[]; results: unknown[] }> = {};

  for (const a of (analyses || [])) {
    if (!agentGroups[a.agent_id]) agentGroups[a.agent_id] = { scores: [], results: [] };
    agentGroups[a.agent_id].scores.push(a.score as number);
    agentGroups[a.agent_id].results.push(a.result);
  }

  for (const [agentId, group] of Object.entries(agentGroups)) {
    const scores = group.scores;
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);

    // Improvement rate: compare first half avg to second half avg
    let improvementRate = 0;
    if (scores.length >= 6) {
      const mid = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(mid); // older (reversed order)
      const secondHalf = scores.slice(0, mid); // newer
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      improvementRate = Math.round((avg2 - avg1) / (scores.length / 10) * 10) / 10;
    }

    agentPatterns[agentId] = {
      agentId,
      totalAnalyses: scores.length,
      avgScore: avg,
      bestScore: best,
      weakAreas: [],
      strongAreas: [],
      improvementRate,
    };
  }

  return {
    userId,
    analysisCount: (analyses || []).length,
    lastUpdated: new Date().toISOString(),
    voice,
    agentPatterns,
    scoringPreferences: {
      rubricWeights: null,
      priorities: [],
      strictness: "balanced",
    },
    industry: null,
  };
}
