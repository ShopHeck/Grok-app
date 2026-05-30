import { AgentConfig } from "./types";

export const proposalAnalyzer: AgentConfig = {
  id: "proposal-analyzer",
  name: "Proposal & SOW Analyzer",
  description:
    "Score your client proposals and statements of work for scope clarity, pricing positioning, risk exposure, and win rate potential.",
  icon: "📊",
  category: "business",
  tier: "pro",
  placeholder:
    "Paste your proposal or statement of work here...\n\nInclude:\n- Project overview / executive summary\n- Scope of work\n- Deliverables\n- Timeline\n- Pricing / budget\n- Terms & conditions",
  inputLabel: "Proposal / Statement of Work",
  maxInputLength: 50000,

  exampleInput: `PROPOSAL: Website Redesign for GrowthCo

Executive Summary:
We're excited to partner with GrowthCo on a complete website redesign. We'll deliver a modern, responsive website that drives conversions.

Scope of Work:
- Redesign all pages
- Mobile responsive
- SEO optimization
- CMS integration
- "Other tasks as needed"

Deliverables:
- New website design
- Development and launch

Timeline:
- Start: ASAP
- End: ~2 months

Pricing:
- Total project fee: $15,000
- 50% upfront, 50% on completion
- Revisions included

Terms:
- All work product owned by client
- Payment net 30
- Unlimited revisions until client is satisfied`,
  systemPrompt: `You are a senior business consultant who has reviewed 5,000+ proposals and SOWs for agencies, freelancers, and consulting firms. You've seen how vague scope destroys profitability and how weak positioning loses deals. You know what separates winning proposals from ignored ones.

Analyze the provided proposal/SOW and return a JSON response with this EXACT structure:
{
  "score": <0-100 overall proposal quality>,
  "summary": "<one sentence verdict>",
  "details": {
    "scope_clarity": {
      "score": <0-100>,
      "specificity": "<specific/moderate/vague>",
      "boundaries": "<clear what's included AND excluded>",
      "scope_creep_risk": "<low/medium/high/extreme>",
      "ambiguous_phrases": ["<phrases that invite scope creep>"],
      "suggestions": ["<how to tighten scope>"]
    },
    "pricing_positioning": {
      "score": <0-100>,
      "value_framing": "<value-based/time-based/commodity>",
      "anchoring": "<effective/weak/absent>",
      "payment_structure": "<protective/risky/standard>",
      "suggestions": ["<pricing improvements>"]
    },
    "deliverables": {
      "score": <0-100>,
      "measurability": "<measurable/vague/missing>",
      "acceptance_criteria": "<defined/implied/missing>",
      "completeness": "<comprehensive/gaps/minimal>",
      "suggestions": ["<deliverable improvements>"]
    },
    "timeline": {
      "score": <0-100>,
      "specificity": "<specific dates/ranges/vague>",
      "milestones": "<defined/implied/missing>",
      "buffer_included": <true/false>,
      "dependencies_noted": <true/false>,
      "suggestions": ["<timeline improvements>"]
    },
    "risk_exposure": {
      "score": <0-100>,
      "unlimited_commitments": ["<any 'unlimited' promises>"],
      "missing_protections": ["<kill fees, change orders, delays>"],
      "liability_gaps": ["<unaddressed risks>"],
      "suggestions": ["<risk mitigation>"]
    },
    "persuasion_and_positioning": {
      "score": <0-100>,
      "unique_value": "<differentiated/generic/absent>",
      "social_proof": <true/false>,
      "urgency_or_scarcity": <true/false>,
      "client_outcomes_focus": "<outcomes/outputs/features>",
      "suggestions": ["<positioning improvements>"]
    },
    "professionalism": {
      "score": <0-100>,
      "formatting": "<polished/adequate/sloppy>",
      "clarity_of_language": "<clear/jargon-heavy/confusing>",
      "completeness": "<all sections present/gaps>",
      "suggestions": ["<professional polish>"]
    }
  },
  "suggestions": ["<top 5 changes to increase win rate and protect profitability>"],
  "rewrite": "<rewritten executive summary + scope section showing best practices>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<relevant excerpt>"}
  ],
  "win_rate_assessment": "<low/moderate/competitive/strong>",
  "profitability_risk": "<low/medium/high — will this project lose money?>"
}

IMPORTANT RULES:
- "Other tasks as needed" or "additional work as required" = CRITICAL scope creep flag
- "Unlimited revisions" is a profitability killer — always flag as critical
- No acceptance criteria = the project never ends — flag it
- "ASAP" is not a timeline — specific dates or week numbers required
- 50% upfront / 50% completion is risky — recommend milestone-based payments
- Proposals without "what's NOT included" sections invite scope creep
- Value-based framing ("increase conversions by 40%") wins over feature lists
- Missing change order process = every change is free — critical flag
- Net 30 without late fees = you're giving a free loan — flag it
- Generic "we're excited to work with you" openings lose to specific client research
- The proposal should sell the outcome, not the process
- Score from the SENDER's perspective (are they protecting themselves AND winning?)`,

  outputSchema: [
    { key: "score", label: "Proposal Score", type: "score", description: "0-100 overall strength" },
    { key: "details.scope_clarity", label: "Scope Clarity", type: "score", description: "Scope creep protection" },
    { key: "details.pricing_positioning", label: "Pricing", type: "score", description: "Value positioning" },
    { key: "details.deliverables", label: "Deliverables", type: "score", description: "Measurable outputs" },
    { key: "details.risk_exposure", label: "Risk Exposure", type: "score", description: "Profitability protection" },
    { key: "details.persuasion_and_positioning", label: "Persuasion", type: "score", description: "Win rate factors" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Win rate boosters" },
    { key: "flags", label: "Red Flags", type: "flags", description: "Scope and profit risks" },
    { key: "rewrite", label: "Rewritten Sections", type: "rewrite", description: "Stronger scope + summary" },
  ],

  scoringRubric: [
    { name: "Scope Clarity", weight: 0.25, description: "Specific, bounded, exclusions listed" },
    { name: "Risk Protection", weight: 0.2, description: "Change orders, kill fees, payment terms" },
    { name: "Pricing & Value", weight: 0.2, description: "Value-framed, well-structured, profitable" },
    { name: "Persuasion", weight: 0.2, description: "Outcome-focused, social proof, differentiated" },
    { name: "Completeness", weight: 0.15, description: "All sections present, professional formatting" },
  ],
};
