import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * GET /api/referrals - Get or create user's referral code
 * POST /api/referrals - Claim a referral code
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for existing referral
  const { data: existing } = await supabase
    .from("referrals")
    .select("code, status, created_at, claimed_at")
    .eq("referrer_id", user.id)
    .single();

  if (existing) {
    // Get count of successful referrals
    const { count } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .eq("status", "rewarded");

    return NextResponse.json({
      code: existing.code,
      totalReferrals: count ?? 0,
    });
  }

  // Generate new referral code
  const code = randomBytes(4).toString("hex").toUpperCase();

  const { data: newReferral, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: user.id,
      code,
    })
    .select("code")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create referral code" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: newReferral.code,
    totalReferrals: 0,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  // Check if user already used a referral
  const { data: profile } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (profile?.referred_by) {
    return NextResponse.json(
      { error: "You have already used a referral code" },
      { status: 400 }
    );
  }

  // Claim the referral
  const { data: result } = await supabase.rpc("claim_referral", {
    p_code: body.code.toUpperCase(),
    p_user_id: user.id,
  });

  if (result === "invalid_code") {
    return NextResponse.json(
      { error: "Invalid or already used referral code" },
      { status: 400 }
    );
  }

  if (result === "self_referral") {
    return NextResponse.json(
      { error: "You cannot use your own referral code" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Referral claimed! You and the referrer each received 5 bonus analyses.",
  });
}
