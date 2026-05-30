import { AgentConfig } from "./types";

export const supportResponseGrader: AgentConfig = {
  id: "support-response-grader",
  name: "Support Response Grader",
  description:
    "Analyze your support replies for empathy, resolution clarity, brand voice, and de-escalation effectiveness. Reduce churn one ticket at a time.",
  icon: "💬",
  category: "business",
  tier: "free",
  placeholder:
    "Paste your customer support response here...\n\nFor best results, include:\n- The customer's original message/complaint\n- Your draft reply\n\nSeparate them with '---' or label them.",
  inputLabel: "Support Conversation",
  maxInputLength: 10000,

  exampleInput: `CUSTOMER MESSAGE:
I've been waiting 3 weeks for my order and nobody is responding to my emails. This is absolutely ridiculous. I want a full refund immediately or I'm disputing the charge with my bank and leaving a review everywhere.

---

MY DRAFT REPLY:
Hi,

Thank you for contacting us. We apologize for the inconvenience. Your order is currently being processed and should ship soon. Please allow 5-7 additional business days for delivery.

Let us know if you have any other questions.

Best regards,
Support Team`,
  systemPrompt: `You are a customer experience expert who has trained support teams at Zappos, Ritz-Carlton, and Apple. You know that every support interaction is a retention moment — the customer either leaves more loyal or starts looking for alternatives.

Analyze the provided support response and return a JSON response with this EXACT structure:
{
  "score": <0-100 overall response quality>,
  "summary": "<one sentence verdict>",
  "details": {
    "empathy": {
      "score": <0-100>,
      "acknowledgment": "<genuine/generic/missing>",
      "emotional_matching": "<matches customer frustration level>",
      "validation": "<customer feels heard? yes/partially/no>",
      "suggestions": ["<how to show more empathy>"]
    },
    "resolution_clarity": {
      "score": <0-100>,
      "problem_addressed": <true/false>,
      "solution_specific": "<specific/vague/missing>",
      "timeline_given": <true/false>,
      "next_steps_clear": <true/false>,
      "suggestions": ["<how to improve resolution>"]
    },
    "de_escalation": {
      "score": <0-100>,
      "tone_appropriate": "<calming/neutral/inflammatory>",
      "ownership_taken": <true/false>,
      "compensation_offered": "<proactive/reactive/none>",
      "suggestions": ["<de-escalation techniques>"]
    },
    "brand_voice": {
      "score": <0-100>,
      "personality": "<human/robotic/overly casual>",
      "consistency": "<professional yet warm/cold/inconsistent>",
      "forbidden_phrases": ["<canned phrases that hurt trust>"],
      "suggestions": ["<voice improvements>"]
    },
    "completeness": {
      "score": <0-100>,
      "all_concerns_addressed": <true/false>,
      "proactive_help": "<anticipates follow-up questions>",
      "missing_elements": ["<what should be added>"],
      "suggestions": ["<completeness improvements>"]
    },
    "efficiency": {
      "score": <0-100>,
      "word_count": <number>,
      "reading_time": "<seconds>",
      "conciseness": "<concise/adequate/bloated>",
      "suggestions": ["<efficiency improvements>"]
    }
  },
  "suggestions": ["<top 5 changes to improve customer satisfaction>"],
  "rewrite": "<complete rewritten response that would delight the customer>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<relevant excerpt>"}
  ],
  "churn_risk": "<low/medium/high — will this customer leave?>",
  "csat_prediction": "<1-5 predicted satisfaction score>"
}

IMPORTANT RULES:
- "We apologize for the inconvenience" is the #1 worst phrase in support — always flag it
- Generic responses to specific problems are retention killers
- If a customer threatens churn/dispute, the response MUST address it directly
- Empathy without action is hollow — both are required
- Timelines must be specific ("by Friday" not "soon" or "5-7 days")
- Taking ownership ("I" language) outperforms hiding behind "the team"
- Proactive compensation for obvious failures prevents escalation
- Never blame the customer, even subtly
- "Let us know if you have questions" is lazy — anticipate the questions
- A frustrated customer needs acknowledgment BEFORE solutions
- Score harshly — most support responses are mediocre template fills`,


  outputSchema: [
    { key: "score", label: "Response Score", type: "score", description: "0-100 overall quality" },
    { key: "details.empathy", label: "Empathy", type: "score", description: "Does the customer feel heard?" },
    { key: "details.resolution_clarity", label: "Resolution", type: "score", description: "Clear solution provided" },
    { key: "details.de_escalation", label: "De-escalation", type: "score", description: "Calming and ownership" },
    { key: "details.brand_voice", label: "Brand Voice", type: "score", description: "Human and professional" },
    { key: "details.completeness", label: "Completeness", type: "score", description: "All concerns addressed" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Satisfaction boosters" },
    { key: "flags", label: "Issues", type: "flags", description: "Response problems" },
    { key: "rewrite", label: "Better Response", type: "rewrite", description: "Rewritten reply" },
  ],

  scoringRubric: [
    { name: "Empathy", weight: 0.25, description: "Genuine acknowledgment, emotional matching" },
    { name: "Resolution", weight: 0.25, description: "Specific solution, clear timeline, next steps" },
    { name: "De-escalation", weight: 0.2, description: "Ownership, calming tone, proactive compensation" },
    { name: "Brand Voice", weight: 0.15, description: "Human, warm, no canned phrases" },
    { name: "Completeness", weight: 0.15, description: "All concerns addressed, proactive help" },
  ],
};
