import { AgentConfig } from "./types";

export const contractReviewer: AgentConfig = {
  id: "contract-reviewer",
  name: "Contract Reviewer",
  description:
    "Get a plain-English risk analysis of any contract or proposal in seconds. Spot red flags before you sign.",
  icon: "📄",
  category: "legal",
  tier: "pro",
  placeholder:
    "Paste the contract, agreement, or proposal text here...\n\nWorks with: freelance contracts, NDAs, SaaS terms, employment agreements, partnership proposals, etc.",
  inputLabel: "Contract / Agreement Text",
  maxInputLength: 50000,
  exampleInput: `INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is entered into as of [Date] between Company Corp ("Client") and [Your Name] ("Contractor").

1. SERVICES: Contractor shall provide web development services as directed by Client.

2. COMPENSATION: Client shall pay Contractor $5,000 upon completion of all deliverables to Client's satisfaction.

3. INTELLECTUAL PROPERTY: All work product created by Contractor shall be the exclusive property of Client, including any pre-existing materials incorporated into the deliverables.

4. NON-COMPETE: Contractor agrees not to provide similar services to any competitor of Client for a period of 2 years following termination.

5. TERMINATION: Client may terminate this agreement at any time without cause. Contractor must provide 30 days notice.

6. LIABILITY: Contractor shall indemnify Client against any and all claims arising from Contractor's work, without limitation.`,
  systemPrompt: `You are a contract analysis expert with deep knowledge of business law, employment law, and freelance/contractor agreements. You help non-lawyers understand what they're signing in plain English.

IMPORTANT DISCLAIMER: You provide educational analysis only, not legal advice. Always recommend consulting an attorney for important agreements.

Analyze the provided contract/agreement and return a JSON response with this EXACT structure:
{
  "score": <0-100 safety score — 100 = very safe for the user, 0 = extremely risky>,
  "summary": "<one sentence plain-English verdict>",
  "details": {
    "payment_terms": {
      "score": <0-100>,
      "analysis": "<plain English explanation>",
      "risks": ["<specific risks>"],
      "suggestions": ["<what to negotiate>"]
    },
    "intellectual_property": {
      "score": <0-100>,
      "analysis": "<what you're giving up>",
      "risks": ["<IP risks>"],
      "suggestions": ["<protective language to add>"]
    },
    "termination": {
      "score": <0-100>,
      "analysis": "<who can end it and how>",
      "risks": ["<termination risks>"],
      "suggestions": ["<fairer terms>"]
    },
    "liability": {
      "score": <0-100>,
      "analysis": "<what you're liable for>",
      "risks": ["<liability exposure>"],
      "suggestions": ["<caps and limitations to add>"]
    },
    "non_compete": {
      "score": <0-100>,
      "analysis": "<restrictions on your future work>",
      "risks": ["<career impact>"],
      "suggestions": ["<reasonable alternatives>"]
    },
    "missing_clauses": {
      "score": <0-100>,
      "missing": ["<important protections not present>"],
      "suggestions": ["<clauses to request>"]
    }
  },
  "suggestions": ["<top 5 most important things to negotiate or change>"],
  "flags": [
    {"severity": "info|warning|critical", "message": "<plain English issue>", "context": "<relevant clause excerpt>"}
  ],
  "plain_english_summary": "<2-3 paragraph plain English explanation of what this contract means for the signer>",
  "negotiation_script": "<suggested language to push back on the worst clauses>"
}

IMPORTANT RULES:
- Write for someone with ZERO legal knowledge — no jargon
- Be protective of the person submitting (assume they're the weaker party)
- Flag one-sided clauses aggressively
- Highlight anything that's unusual or non-standard
- "Unlimited liability" and "work for hire on pre-existing IP" are always critical flags
- Score from the signer's perspective (low = dangerous for them)
- Always note what's MISSING (no late payment penalties, no kill fee, etc.)
- Provide specific counter-language they can propose`,

  outputSchema: [
    { key: "score", label: "Safety Score", type: "score", description: "0-100 how safe this contract is for you" },
    { key: "details.payment_terms", label: "Payment Terms", type: "score", description: "Payment safety" },
    { key: "details.intellectual_property", label: "IP Rights", type: "score", description: "Intellectual property" },
    { key: "details.liability", label: "Liability Risk", type: "score", description: "Your exposure" },
    { key: "details.non_compete", label: "Non-Compete", type: "score", description: "Future restrictions" },
    { key: "details.missing_clauses", label: "Missing Protections", type: "sections", description: "What's not covered" },
    { key: "suggestions", label: "What to Negotiate", type: "list", description: "Priority changes" },
    { key: "flags", label: "Red Flags", type: "flags", description: "Critical issues found" },
    { key: "rewrite", label: "Counter-Language", type: "rewrite", description: "Suggested pushback" },
  ],

  scoringRubric: [
    { name: "Payment Protection", weight: 0.25, description: "Clear payment, milestones, late fees" },
    { name: "IP Fairness", weight: 0.2, description: "Reasonable IP terms, pre-existing work protected" },
    { name: "Liability Limits", weight: 0.2, description: "Capped liability, mutual indemnification" },
    { name: "Termination Balance", weight: 0.15, description: "Fair exit for both parties, kill fees" },
    { name: "Restrictive Covenants", weight: 0.1, description: "Reasonable non-compete/NDA scope" },
    { name: "Completeness", weight: 0.1, description: "All standard protections present" },
  ],
};
