import { AgentConfig } from "./types";

export const listingOptimizer: AgentConfig = {
  id: "listing-optimizer",
  name: "Listing Optimizer",
  description:
    "Score and improve your product listings for SEO, readability, and conversion across any marketplace.",
  icon: "🏪",
  category: "business",
  tier: "free",
  placeholder:
    "Paste your product listing here...\n\nInclude the title, description, bullet points, and any keywords you're targeting.",
  inputLabel: "Product Listing",
  maxInputLength: 10000,
  exampleInput: `Title: Bamboo Cutting Board - Large Kitchen Chopping Board

Description: This cutting board is made from bamboo. It's big and good for cutting things. You can use it for vegetables, meat, and other foods. It has a groove around the edge to catch juice. It's eco-friendly because bamboo grows fast. Makes a great gift.

Bullet Points:
- Made from bamboo
- Large size
- Has juice groove
- Eco-friendly
- Good for gifts`,
  systemPrompt: `You are a world-class e-commerce listing optimization expert who has helped sellers generate over $50M in revenue across Amazon, Etsy, Shopify, and other marketplaces. You understand SEO, buyer psychology, and conversion optimization deeply.

Analyze the provided product listing and return a JSON response with this EXACT structure:
{
  "score": <0-100 overall listing quality score>,
  "summary": "<one sentence verdict on listing quality>",
  "details": {
    "seo": {
      "score": <0-100>,
      "keywords_found": ["<keywords detected>"],
      "missing_keywords": ["<suggested keywords to add>"],
      "keyword_density": "<assessment>",
      "suggestions": ["<SEO improvements>"]
    },
    "title": {
      "score": <0-100>,
      "length": <character count>,
      "structure": "<assessment of title format>",
      "suggestions": ["<title improvements>"]
    },
    "description": {
      "score": <0-100>,
      "readability": "<grade level>",
      "emotional_appeal": "<low/medium/high>",
      "benefit_focused": <true/false>,
      "suggestions": ["<description improvements>"]
    },
    "bullet_points": {
      "score": <0-100>,
      "count": <number>,
      "format_quality": "<good/needs work/poor>",
      "suggestions": ["<bullet point improvements>"]
    },
    "conversion_elements": {
      "score": <0-100>,
      "social_proof": <true/false>,
      "urgency": <true/false>,
      "unique_value": <true/false>,
      "suggestions": ["<conversion improvements>"]
    },
    "competitive_positioning": {
      "score": <0-100>,
      "differentiation": "<low/medium/high>",
      "suggestions": ["<how to stand out>"]
    }
  },
  "suggestions": ["<top 5 actionable improvements in priority order>"],
  "rewrite": "<complete rewritten listing with optimized title, description, and bullet points>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<excerpt>"}
  ],
  "estimated_improvement": "<X% potential increase in conversion>"
}

IMPORTANT RULES:
- Evaluate as if this listing competes against thousands of similar products
- Penalize generic descriptions that could apply to any product
- Reward benefit-focused copy over feature-focused
- Flag any claims that might violate marketplace policies
- The rewrite should be dramatically better — show what great looks like
- Consider mobile-first (most shoppers browse on phones)
- Suggest A/B test-worthy title variations
- Identify the target buyer persona from context`,

  outputSchema: [
    { key: "score", label: "Overall Score", type: "score", description: "0-100 listing quality" },
    { key: "details.seo", label: "SEO Quality", type: "score", description: "Search optimization" },
    { key: "details.title", label: "Title Strength", type: "score", description: "Title effectiveness" },
    { key: "details.description", label: "Description", type: "score", description: "Description quality" },
    { key: "details.conversion_elements", label: "Conversion", type: "score", description: "Conversion optimization" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Priority improvements" },
    { key: "flags", label: "Issues", type: "flags", description: "Problems found" },
    { key: "rewrite", label: "Optimized Listing", type: "rewrite", description: "Rewritten listing" },
  ],

  scoringRubric: [
    { name: "SEO", weight: 0.25, description: "Keyword optimization and discoverability" },
    { name: "Title", weight: 0.2, description: "Title format, length, and keyword placement" },
    { name: "Description", weight: 0.2, description: "Readability, benefits, emotional appeal" },
    { name: "Bullet Points", weight: 0.15, description: "Format, scannability, benefit-focused" },
    { name: "Conversion", weight: 0.2, description: "Social proof, urgency, unique value prop" },
  ],
};
