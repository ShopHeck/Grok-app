import Stripe from "stripe";

// Singleton Stripe client
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

// Price IDs for each plan — resolved lazily to avoid crashing at module load
// when env vars aren't set yet (e.g., during build)
export function getStripePrices() {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID || "",
    team: process.env.STRIPE_TEAM_PRICE_ID || "",
  };
}

// Keep static export for backward compatibility (used by resolveSubscriptionPlan)
export const STRIPE_PRICES = {
  get pro() { return process.env.STRIPE_PRO_PRICE_ID || ""; },
  get team() { return process.env.STRIPE_TEAM_PRICE_ID || ""; },
} as const;

export type PaidPlan = "pro" | "team";

// Map Stripe subscription status + price to our plan names
export function resolveSubscriptionPlan(
  subscription: Stripe.Subscription
): "pro" | "team" | "free" | "canceled" | "past_due" {
  if (subscription.status === "canceled") return "canceled";
  if (subscription.status === "past_due") return "past_due";

  if (subscription.status === "active" || subscription.status === "trialing") {
    const priceId = subscription.items.data[0]?.price?.id;
    if (priceId && priceId === process.env.STRIPE_TEAM_PRICE_ID) return "team";
    return "pro"; // default paid plan
  }

  return "free";
}
