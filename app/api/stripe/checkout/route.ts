import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PaidPlan } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/sign-in", appUrl));
  }

  // Determine which plan to checkout
  let plan: PaidPlan = "pro";
  try {
    const body = await request.formData();
    const requestedPlan = body.get("plan");
    if (requestedPlan === "team") plan = "team";
  } catch {
    // Default to pro if no form data
  }

  // Resolve price ID at runtime (not module load) to avoid undefined env vars
  const priceId =
    plan === "team"
      ? process.env.STRIPE_TEAM_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    console.error(`[checkout] Missing STRIPE_${plan.toUpperCase()}_PRICE_ID env var`);
    return NextResponse.json(
      { error: "Payment system not configured. Please contact support." },
      { status: 500 }
    );
  }

  // Get profile — use user.email as fallback since email may not be in profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id;

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!, // Email from auth.users, always available
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    console.error("[checkout] Stripe session created without URL", session.id);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
