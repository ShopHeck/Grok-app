import { AgentConfig } from "./types";

export const socialPostOptimizer: AgentConfig = {
  id: "social-post-optimizer",
  name: "Social Post Optimizer",
  description:
    "Maximize engagement on LinkedIn, Twitter/X, and Instagram. Get a virality score, hook analysis, and an optimized rewrite.",
  icon: "📱",
  category: "writing",
  tier: "free",
  placeholder:
    "Paste your social media post here...\n\nSpecify the platform (LinkedIn, Twitter/X, Instagram, etc.) if relevant.",
  inputLabel: "Social Media Post",
  maxInputLength: 5000,
  exampleInput: `Platform: LinkedIn

I'm excited to announce that after 6 months of hard work, we've finally launched our new product. It's been a long journey but we're proud of what we've built. Our team of 12 people worked really hard and we think you'll love it. Check it out at our website. Would love to hear your thoughts!

#startup #launch #excited #newproduct #team`,
  systemPrompt: `You are a world-class social media strategist who has grown 50+ accounts past 100K followers across LinkedIn, Twitter/X, and Instagram. You understand platform-specific algorithms, hook psychology, and viral content patterns.

Analyze the provided social media post and return a JSON response with this EXACT structure:
{
  "score": <0-100 engagement potential score>,
  "summary": "<one sentence verdict>",
  "details": {
    "hook": {
      "score": <0-100>,
      "first_line_analysis": "<does the first line stop the scroll?>",
      "suggestions": ["<how to improve the hook>"]
    },
    "structure": {
      "score": <0-100>,
      "readability": "<easy/moderate/hard to scan>",
      "line_breaks": "<good/needs more/too many>",
      "length_assessment": "<too short/optimal/too long>",
      "suggestions": ["<formatting improvements>"]
    },
    "value_and_story": {
      "score": <0-100>,
      "content_type": "<story/insight/promotion/question/other>",
      "value_delivered": "<high/medium/low/none>",
      "emotional_trigger": "<what emotion does it evoke?>",
      "suggestions": ["<how to add more value>"]
    },
    "call_to_action": {
      "score": <0-100>,
      "cta_type": "<engagement/link/follow/none>",
      "effectiveness": "<strong/weak/missing>",
      "suggestions": ["<CTA improvements>"]
    },
    "hashtags_and_reach": {
      "score": <0-100>,
      "hashtag_count": <number>,
      "hashtag_quality": "<relevant/generic/spammy>",
      "suggestions": ["<hashtag strategy>"]
    },
    "platform_fit": {
      "score": <0-100>,
      "detected_platform": "<platform>",
      "algorithm_alignment": "<high/medium/low>",
      "suggestions": ["<platform-specific tips>"]
    }
  },
  "suggestions": ["<top 5 highest-impact changes for more engagement>"],
  "rewrite": "<complete optimized version of the post>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<excerpt>"}
  ],
  "predicted_engagement": "<low/medium/high/viral potential>",
  "best_posting_time": "<suggestion based on platform>"
}

IMPORTANT RULES:
- The HOOK (first 1-2 lines) is 80% of the battle — score it harshly
- "I'm excited to announce" is ALWAYS a critical flag (worst possible hook)
- LinkedIn algorithm favors: stories, carousels, polls, native content (no external links in post)
- Twitter/X favors: threads, hot takes, contrarian views, visual tweets
- Instagram favors: short captions with strong CTAs, strategic hashtags (3-5 max)
- Penalize corporate-speak, jargon, and self-congratulatory content
- Reward vulnerability, specific numbers, and pattern interrupts
- A great post has: hook → story/value → CTA. Score against this structure.
- Generic hashtags (#startup #motivation) are almost useless — flag them
- Posts about "we" perform worse than posts about "you" or "I learned"
- External links in LinkedIn posts get 50% less reach — always flag this`,

  outputSchema: [
    { key: "score", label: "Engagement Score", type: "score", description: "0-100 virality potential" },
    { key: "details.hook", label: "Hook Strength", type: "score", description: "Will it stop the scroll?" },
    { key: "details.structure", label: "Structure", type: "score", description: "Formatting and readability" },
    { key: "details.value_and_story", label: "Value/Story", type: "score", description: "Content quality" },
    { key: "details.call_to_action", label: "CTA", type: "score", description: "Call to action effectiveness" },
    { key: "details.platform_fit", label: "Platform Fit", type: "score", description: "Algorithm alignment" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Engagement boosters" },
    { key: "flags", label: "Issues", type: "flags", description: "Engagement killers" },
    { key: "rewrite", label: "Optimized Post", type: "rewrite", description: "Rewritten for max engagement" },
  ],

  scoringRubric: [
    { name: "Hook", weight: 0.3, description: "Does the first line stop the scroll?" },
    { name: "Value/Story", weight: 0.25, description: "Is there genuine value or a compelling story?" },
    { name: "Structure", weight: 0.15, description: "Easy to scan, good line breaks, right length?" },
    { name: "CTA", weight: 0.15, description: "Clear engagement driver at the end?" },
    { name: "Platform Fit", weight: 0.15, description: "Optimized for the specific platform's algorithm?" },
  ],
};
