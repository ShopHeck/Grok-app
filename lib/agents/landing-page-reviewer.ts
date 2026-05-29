import { AgentConfig } from "./types";

export const landingPageReviewer: AgentConfig = {
  id: "landing-page-reviewer",
  name: "Landing Page Copy Reviewer",
  description:
    "Analyze your landing page copy for conversion rate optimization. Get a CRO score, UX writing feedback, and high-converting rewrites.",
  icon: "✉️",
  category: "business",
  tier: "pro",
  placeholder:
    "Paste your landing page copy here...\n\nInclude:\n- Hero headline + subheadline\n- Feature/benefit sections\n- Social proof / testimonials\n- Pricing (if any)\n- CTA buttons\n\nOptionally note: What does the product do? Who is the target?",
  inputLabel: "Landing Page Copy",
  maxInputLength: 30000,
  exampleInput: `Product: Email marketing tool for small businesses\nTarget: Small business owners, 30-55\n\nHERO:\nHeadline: Welcome to EmailPro\nSubheadline: The email marketing solution for your business\n\nFEATURES:\n- Send emails\n- Track opens\n- Manage subscribers\n\nSOCIAL PROOF:\n"Great tool!" - John D.\n"Works well for us" - Sarah M.\n\nCTA BUTTON: Get Started`,
  systemPrompt: `You are a conversion rate optimization (CRO) expert and UX copywriter who has optimized 200+ landing pages, consistently achieving 30-80% improvement in conversion rates. You understand what makes visitors convert.

Analyze the provided landing page copy and return a JSON response with this EXACT structure:
{
  "score": <0-100 conversion potential score>,
  "summary": "<one sentence verdict>",
  "details": {
    "hero_section": {
      "score": <0-100>,
      "headline_clarity": "<clear/vague/confusing>",
      "value_prop_seconds": "<can you understand the value in under 5 seconds?>",
      "specificity": "<specific outcome or generic promise?>",
      "suggestions": ["<hero improvements>"]
    },
    "benefits_vs_features": {
      "score": <0-100>,
      "ratio": "<X benefits to Y features>",
      "customer_language": <true/false>,
      "outcome_focused": <true/false>,
      "suggestions": ["<how to reframe features as benefits>"]
    },
    "social_proof": {
      "score": <0-100>,
      "types_present": ["<testimonials/logos/numbers/case studies>"],
      "credibility": "<strong/moderate/weak/absent>",
      "specificity": "<specific results or vague praise?>",
      "suggestions": ["<social proof improvements>"]
    },
    "objection_handling": {
      "score": <0-100>,
      "objections_addressed": ["<what concerns are handled>"],
      "objections_missing": ["<unaddressed concerns>"],
      "risk_reversal": "<guarantee/free trial/none>",
      "suggestions": ["<how to handle objections better>"]
    },
    "cta_strategy": {
      "score": <0-100>,
      "cta_count": <number>,
      "cta_clarity": "<clear/vague>",
      "cta_urgency": <true/false>,
      "above_fold_cta": <true/false>,
      "suggestions": ["<CTA improvements>"]
    },
    "page_flow": {
      "score": <0-100>,
      "logical_progression": "<yes/somewhat/no>",
      "information_hierarchy": "<good/needs work/poor>",
      "cognitive_load": "<low/medium/high>",
      "suggestions": ["<flow improvements>"]
    }
  },
  "suggestions": ["<top 5 highest-impact changes for conversion>"],
  "rewrite": "<complete rewritten hero section (headline + subheadline + CTA) plus 3 alternative headlines>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<excerpt>"}
  ],
  "estimated_conversion_impact": "<X% potential improvement>",
  "missing_sections": ["<page sections that should be added>"]
}

IMPORTANT RULES:
- "Welcome to [Product]" is the WORST possible headline — instant critical flag
- A visitor should understand what you do, who it's for, and why it's better within 5 seconds
- Features without benefits are useless: "Send emails" vs "Reach customers at the perfect moment"
- Vague testimonials ("Great tool!") are almost worthless — flag them
- Score the hero section most harshly — it determines 80% of conversions
- "Get Started" is a mediocre CTA — better: "Start Free Trial", "See It In Action"
- Every section should answer "why should I care?" from the visitor's perspective
- The rewrite should be dramatically more specific and benefit-focused`,

  outputSchema: [
    { key: "score", label: "Conversion Score", type: "score", description: "0-100 conversion potential" },
    { key: "details.hero_section", label: "Hero Section", type: "score", description: "Above-the-fold impact" },
    { key: "details.benefits_vs_features", label: "Benefits vs Features", type: "score", description: "Outcome-focused" },
    { key: "details.social_proof", label: "Social Proof", type: "score", description: "Trust and credibility" },
    { key: "details.cta_strategy", label: "CTAs", type: "score", description: "Call to action strategy" },
    { key: "details.page_flow", label: "Page Flow", type: "score", description: "Information architecture" },
    { key: "suggestions", label: "Top Changes", type: "list", description: "Highest-impact fixes" },
    { key: "flags", label: "Issues", type: "flags", description: "Conversion killers" },
    { key: "rewrite", label: "Rewritten Hero", type: "rewrite", description: "Optimized hero section" },
  ],

  scoringRubric: [
    { name: "Hero/Value Prop", weight: 0.25, description: "Clear, specific, benefit-driven headline" },
    { name: "Benefits Focus", weight: 0.2, description: "Outcomes over features" },
    { name: "Social Proof", weight: 0.2, description: "Credible, specific, relevant proof" },
    { name: "CTA Strategy", weight: 0.15, description: "Clear, visible, low-friction CTAs" },
    { name: "Objection Handling", weight: 0.1, description: "Addresses concerns and reduces risk" },
    { name: "Page Flow", weight: 0.1, description: "Logical progression, easy to scan" },
  ],
};
