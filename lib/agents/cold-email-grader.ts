import { AgentConfig } from "./types";

export const coldEmailGrader: AgentConfig = {
  id: "cold-email-grader",
  name: "Cold Email Grader",
  description:
    "Score your outreach emails for deliverability, persuasion, and reply likelihood before you hit send.",
  icon: "📬",
  category: "writing",
  tier: "free",
  placeholder:
    "Paste your cold email here...\n\nExample:\nHi {{firstName}},\n\nI noticed your team at {{company}} recently launched...",
  inputLabel: "Email Draft",
  maxInputLength: 5000,
  exampleInput: `Hi Sarah,

I saw that Acme Corp just raised a Series B — congrats! I imagine scaling the sales team is top of mind right now.

We help companies like yours reduce onboarding time for new reps by 60% with AI-powered coaching. Companies like Stripe and Notion use us to get reps productive in days, not months.

Would you be open to a 15-min call this week to see if it's a fit?

Best,
Jake`,
  systemPrompt: `You are an expert cold email analyst with 15 years of B2B sales experience. You've analyzed 100,000+ cold emails and know exactly what drives replies vs what gets ignored or marked as spam.

Analyze the provided cold email and return a JSON response with this EXACT structure:
{
  "score": <0-100 overall score>,
  "summary": "<one sentence verdict>",
  "details": {
    "deliverability": {
      "score": <0-100>,
      "spam_triggers": ["<list of spam words/patterns found>"],
      "suggestions": ["<how to improve>"]
    },
    "subject_line": {
      "score": <0-100>,
      "analysis": "<assessment if subject line present, or note it's missing>",
      "suggestions": ["<improvements>"]
    },
    "personalization": {
      "score": <0-100>,
      "elements_found": ["<personalization elements>"],
      "suggestions": ["<how to personalize more>"]
    },
    "value_proposition": {
      "score": <0-100>,
      "clarity": "<clear/vague/missing>",
      "suggestions": ["<improvements>"]
    },
    "call_to_action": {
      "score": <0-100>,
      "type": "<type of CTA>",
      "friction_level": "<low/medium/high>",
      "suggestions": ["<improvements>"]
    },
    "tone_and_length": {
      "score": <0-100>,
      "word_count": <number>,
      "reading_level": "<grade level>",
      "tone": "<professional/casual/aggressive/etc>",
      "suggestions": ["<improvements>"]
    }
  },
  "suggestions": ["<top 3-5 actionable improvements>"],
  "rewrite": "<improved version of the full email>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<relevant excerpt>"}
  ],
  "reply_likelihood": "<low/medium/high>",
  "estimated_reply_rate": "<X%>"
}

IMPORTANT RULES:
- Be brutally honest but constructive
- Score harshly — most cold emails are bad, reflect that
- The rewrite should be meaningfully different and better, not just minor tweaks
- Flag spam triggers aggressively (exclamation marks, ALL CAPS, trigger words)
- Consider mobile readability (most emails read on phone)
- Penalize emails over 150 words heavily
- Reward specificity and research-backed personalization`,

  outputSchema: [
    { key: "score", label: "Overall Score", type: "score", description: "0-100 email quality score" },
    { key: "details.deliverability", label: "Deliverability", type: "score", description: "Spam risk assessment" },
    { key: "details.personalization", label: "Personalization", type: "score", description: "How personalized is it" },
    { key: "details.value_proposition", label: "Value Prop", type: "score", description: "Clarity of offer" },
    { key: "details.call_to_action", label: "CTA Strength", type: "score", description: "Call to action effectiveness" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Actionable suggestions" },
    { key: "flags", label: "Issues", type: "flags", description: "Problems found" },
    { key: "rewrite", label: "Suggested Rewrite", type: "rewrite", description: "Improved version" },
  ],

  scoringRubric: [
    { name: "Deliverability", weight: 0.2, description: "Will it land in inbox? No spam triggers?" },
    { name: "Personalization", weight: 0.25, description: "Does it show research? Is it specific to the recipient?" },
    { name: "Value Proposition", weight: 0.2, description: "Is the offer clear and compelling?" },
    { name: "CTA", weight: 0.15, description: "Is the ask low-friction and clear?" },
    { name: "Tone & Length", weight: 0.1, description: "Professional but human? Under 150 words?" },
    { name: "Subject Line", weight: 0.1, description: "Compelling? Opens curiosity?" },
  ],
};
