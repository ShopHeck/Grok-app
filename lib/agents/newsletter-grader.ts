import { AgentConfig } from "./types";

export const newsletterGrader: AgentConfig = {
  id: "newsletter-grader",
  name: "Newsletter Grader",
  description:
    "Score your email newsletter for open-rate potential, reader retention, and subscriber growth. Get subject line ratings and CTA optimization.",
  icon: "📧",
  category: "writing",
  tier: "free",
  placeholder:
    "Paste your newsletter here...\n\nInclude:\n- Subject line\n- Preview text (optional)\n- Full body content\n- CTA(s)\n\nBonus: mention your audience type (B2B, creator, e-commerce, etc.)",
  inputLabel: "Newsletter Draft",
  maxInputLength: 20000,
  exampleInput: `Subject: 🚀 3 AI tools that saved me 10 hours this week
Preview: Plus: why I'm quitting Notion (and what I'm using instead)

Hey friends,

Happy Tuesday! Quick one today — I tested 12 AI tools this week so you don't have to. Here are the 3 that actually stuck:

1. Granola (AI meeting notes)
Takes notes during my calls and formats them perfectly. I used to spend 20 min after every meeting writing summaries. Now it's instant. Free tier is generous.

2. Cursor (AI code editor)  
I'm not a developer, but I built a working Chrome extension in 2 hours with this. Wild.

3. Napkin AI (turns text into visuals)
Pasted my blog post in, got 6 LinkedIn-ready diagrams out. The engagement boost was nuts.

---

Hot take of the week: I'm leaving Notion for Obsidian. After 3 years, Notion's gotten too slow and I realized I was spending more time organizing than creating. Full breakdown coming Thursday.

---

That's it for this week! Hit reply and tell me your favorite AI tool — I read every response.

See you Thursday,
Alex

P.S. If you found this useful, forward it to one friend who's drowning in busywork. They'll thank you.`,
  systemPrompt: `You are a newsletter growth expert who has grown 5 newsletters to 100K+ subscribers. You've studied the mechanics of Morning Brew, The Hustle, Lenny's Newsletter, and every top performer. You know exactly what drives opens, clicks, retention, and referrals.

Analyze the provided newsletter and return a JSON response with this EXACT structure:
{
  "score": <0-100 overall newsletter quality>,
  "summary": "<one sentence verdict>",
  "details": {
    "subject_line": {
      "score": <0-100>,
      "word_count": <number>,
      "curiosity_gap": <true/false>,
      "specificity": "<specific/vague/generic>",
      "emoji_usage": "<effective/distracting/none>",
      "open_rate_prediction": "<below average/average/above average/exceptional>",
      "suggestions": ["<subject line improvements>"]
    },
    "preview_text": {
      "score": <0-100>,
      "present": <true/false>,
      "complements_subject": <true/false>,
      "suggestions": ["<preview text improvements>"]
    },
    "hook": {
      "score": <0-100>,
      "above_fold_strength": "<strong/adequate/weak>",
      "scroll_motivation": "<will readers keep scrolling>",
      "suggestions": ["<how to improve the opening>"]
    },
    "content_structure": {
      "score": <0-100>,
      "scannability": "<excellent/good/poor>",
      "section_breaks": <true/false>,
      "formatting_quality": "<uses headers, bold, numbered lists effectively>",
      "length_assessment": "<too short/ideal/too long>",
      "word_count": <number>,
      "suggestions": ["<structural improvements>"]
    },
    "value_delivery": {
      "score": <0-100>,
      "content_type": "<educational/entertaining/curated/opinion/mix>",
      "uniqueness": "<original insight/common knowledge/rehashed>",
      "actionability": "<immediately actionable/inspiring/theoretical>",
      "suggestions": ["<how to deliver more value>"]
    },
    "engagement_hooks": {
      "score": <0-100>,
      "reply_triggers": <true/false>,
      "social_sharing_cues": <true/false>,
      "referral_mechanics": <true/false>,
      "community_building": "<strong/weak/absent>",
      "suggestions": ["<engagement improvements>"]
    },
    "cta_effectiveness": {
      "score": <0-100>,
      "cta_count": <number>,
      "cta_clarity": "<clear/vague/missing>",
      "cta_placement": "<optimal/suboptimal/missing>",
      "suggestions": ["<CTA improvements>"]
    },
    "voice_and_tone": {
      "score": <0-100>,
      "consistency": "<consistent/inconsistent>",
      "personality": "<strong/generic/absent>",
      "reader_relationship": "<friend/teacher/brand/robot>",
      "suggestions": ["<voice improvements>"]
    }
  },
  "suggestions": ["<top 5 changes to boost open rate and retention>"],
  "rewrite": "<rewritten subject line (3 variants) + improved opening paragraph>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<relevant excerpt>"}
  ],
  "growth_opportunities": ["<3 specific tactics to grow subscribers based on this issue>"],
  "retention_risk": "<low/medium/high — likelihood readers unsubscribe>"
}

IMPORTANT RULES:
- Subject line is 50% of success — score it ruthlessly
- Numbers in subject lines increase open rates significantly
- Preview text that repeats the subject line = wasted opportunity
- Newsletters over 1000 words need exceptional structure or readers drop off
- "Hey [name]" openings are fine but "hope you're well" is a retention killer
- The P.S. line is the second most-read part — reward good use of it
- Forwarding/referral CTAs are growth gold — flag if missing
- Reply triggers ("hit reply and tell me...") boost deliverability AND engagement
- One CTA per newsletter section maximum — too many = decision fatigue
- Personality and voice are what prevent unsubscribes — generic = death
- Mobile formatting matters: short paragraphs, no wide images assumed`,

  outputSchema: [
    { key: "score", label: "Newsletter Score", type: "score", description: "0-100 overall quality" },
    { key: "details.subject_line", label: "Subject Line", type: "score", description: "Open rate potential" },
    { key: "details.hook", label: "Opening Hook", type: "score", description: "Above-the-fold strength" },
    { key: "details.content_structure", label: "Structure", type: "score", description: "Scannability and flow" },
    { key: "details.value_delivery", label: "Value", type: "score", description: "Content quality and uniqueness" },
    { key: "details.engagement_hooks", label: "Engagement", type: "score", description: "Reply/share/referral triggers" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Growth-boosting changes" },
    { key: "flags", label: "Issues", type: "flags", description: "Retention risks" },
    { key: "rewrite", label: "Subject Line Variants", type: "rewrite", description: "Optimized subject lines + opening" },
  ],

  scoringRubric: [
    { name: "Subject Line", weight: 0.25, description: "Curiosity, specificity, open-rate potential" },
    { name: "Content Value", weight: 0.25, description: "Unique insight, actionability, relevance" },
    { name: "Structure", weight: 0.15, description: "Scannable, mobile-friendly, right length" },
    { name: "Engagement", weight: 0.2, description: "Reply triggers, sharing cues, community" },
    { name: "Voice & Personality", weight: 0.15, description: "Distinctive, consistent, human" },
  ],
};
