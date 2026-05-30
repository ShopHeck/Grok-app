/**
 * Agent Marketplace types — community-built agents with revenue share.
 */

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  author_id: string;
  author_name: string;
  system_prompt: string;
  output_schema: unknown[];
  scoring_rubric: unknown[];
  placeholder: string;
  input_label: string;
  max_input_length: number;
  /** Pricing: free, one-time, subscription */
  pricing_type: "free" | "one_time" | "subscription";
  /** Price in cents (0 = free) */
  price_cents: number;
  /** Revenue share percentage for creator (default 30%) */
  revenue_share_pct: number;
  /** Public marketplace listing */
  is_published: boolean;
  /** Approved by AgentDesk team */
  is_approved: boolean;
  /** Featured on homepage */
  is_featured: boolean;
  /** White-label: agency branding */
  white_label: WhiteLabelConfig | null;
  /** Stats */
  installs_count: number;
  uses_count: number;
  rating: number;
  rating_count: number;
  /** Timestamps */
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelConfig {
  brand_name: string;
  brand_logo_url: string | null;
  brand_color: string;
  custom_footer_text: string | null;
}

export interface MarketplaceReview {
  id: string;
  agent_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface CreatorEarnings {
  total_earned_cents: number;
  pending_payout_cents: number;
  total_installs: number;
  total_uses: number;
  agents_published: number;
  monthly_breakdown: { month: string; earned_cents: number; installs: number }[];
}

export const MARKETPLACE_CATEGORIES = [
  { id: "writing", label: "Writing & Copy", icon: "✍️" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "legal", label: "Legal & Compliance", icon: "⚖️" },
  { id: "marketing", label: "Marketing", icon: "📣" },
  { id: "sales", label: "Sales & Outreach", icon: "🎯" },
  { id: "product", label: "Product & Technical", icon: "🛠️" },
  { id: "hr", label: "HR & Recruiting", icon: "👥" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "niche", label: "Niche / Vertical", icon: "🔬" },
] as const;

export const MARKETPLACE_SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "highest-rated", label: "Highest Rated" },
  { id: "newest", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "most-used", label: "Most Used" },
] as const;

/** Revenue share: creator gets 30%, platform gets 70% */
export const DEFAULT_REVENUE_SHARE = 30;
export const MIN_PAYOUT_CENTS = 5000; // $50 minimum payout
