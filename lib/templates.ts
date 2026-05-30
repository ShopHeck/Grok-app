/**
 * Template & Playbook types for community-driven content.
 */

export interface Template {
  id: string;
  title: string;
  description: string;
  agent_id: string;
  content: string;
  score: number | null;
  author_id: string;
  author_name: string;
  is_official: boolean;
  is_public: boolean;
  category: TemplateCategory;
  tags: string[];
  uses_count: number;
  forks_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  author_id: string;
  author_name: string;
  steps: PlaybookStep[];
  is_public: boolean;
  uses_count: number;
  created_at: string;
}

export interface PlaybookStep {
  order: number;
  agent_id: string;
  title: string;
  description: string;
  template_id?: string;
  depends_on?: number[];
}

export type TemplateCategory =
  | "cold-outreach"
  | "content-marketing"
  | "sales"
  | "recruiting"
  | "legal"
  | "fundraising"
  | "product"
  | "support"
  | "general";

export const TEMPLATE_CATEGORIES: {
  id: TemplateCategory;
  label: string;
  icon: string;
}[] = [
  { id: "cold-outreach", label: "Cold Outreach", icon: "📬" },
  { id: "content-marketing", label: "Content Marketing", icon: "📝" },
  { id: "sales", label: "Sales", icon: "💰" },
  { id: "recruiting", label: "Recruiting", icon: "👥" },
  { id: "legal", label: "Legal", icon: "⚖️" },
  { id: "fundraising", label: "Fundraising", icon: "🚀" },
  { id: "product", label: "Product", icon: "🛠️" },
  { id: "support", label: "Support", icon: "💬" },
  { id: "general", label: "General", icon: "✨" },
];

export const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "highest-rated", label: "Highest Rated" },
  { id: "newest", label: "Newest" },
  { id: "most-forked", label: "Most Forked" },
] as const;
