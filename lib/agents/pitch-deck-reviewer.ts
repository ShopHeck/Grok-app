import { AgentConfig } from "./types";

export const pitchDeckReviewer: AgentConfig = {
  id: "pitch-deck-reviewer",
  name: "Pitch Deck Script Reviewer",
  description:
    "Analyze your startup pitch deck script or investor memo for narrative clarity, objection handling, and fundability signals.",
  icon: "🎤",
  category: "business",
  tier: "pro",
  placeholder:
    "Paste your pitch deck script, investor memo, or presentation notes here...\n\nInclude:\n- Problem statement\n- Solution / product\n- Market size\n- Business model\n- Traction / metrics\n- Team overview\n- The ask (funding amount & use of funds)",
  inputLabel: "Pitch Script / Investor Memo",
  maxInputLength: 50000,
  exampleInput: `Slide 1 - Title:
PetMatch AI — The Tinder for Pet Adoption

Slide 2 - Problem:
8 million animals enter shelters every year. Adopters browse outdated listings with bad photos and no personality info. 40% of adopted pets are returned within 6 months due to bad matches.

Slide 3 - Solution:
We use AI to match adopters with pets based on lifestyle compatibility. Our algorithm considers living space, activity level, experience, and family composition to find the perfect match.

Slide 4 - Market:
The pet industry is worth $150B globally. We're targeting the $2B pet adoption market in the US.

Slide 5 - Traction:
- Launched 3 months ago
- 12,000 users
- 340 successful adoptions
- 92% retention rate (pets not returned)
- Partnered with 45 shelters

Slide 6 - Business Model:
Free for adopters. Shelters pay $99/month for premium listings and our matching algorithm. Planned: pet insurance referral revenue.

Slide 7 - Team:
- Sarah (CEO): 5 years at Chewy, product lead
- Mike (CTO): ML engineer, ex-Google
- Lisa (COO): Operations at local shelter network for 8 years

Slide 8 - Ask:
Raising $2M seed round to expand to 500 shelters, hire 3 engineers, and launch in 5 new markets.`,
  systemPrompt: `You are an elite pitch deck coach who has helped founders raise $500M+ combined. You've worked at Y Combinator, Sequoia, and advised 200+ startups on their fundraising narratives. You know exactly what makes investors lean in vs tune out.

Analyze the provided pitch deck script/investor memo and return a JSON response with this EXACT structure:
{
  "score": <0-100 fundability score>,
  "summary": "<one sentence verdict on fundraising readiness>",
  "details": {
    "narrative_arc": {
      "score": <0-100>,
      "structure": "<problem-solution-traction-ask progression quality>",
      "hook_quality": "<does the opening grab attention>",
      "suggestions": ["<how to improve story flow>"]
    },
    "problem_definition": {
      "score": <0-100>,
      "clarity": "<clear/vague/missing>",
      "urgency": "<convincing/weak/missing>",
      "data_backed": <true/false>,
      "suggestions": ["<how to sharpen the problem>"]
    },
    "solution_positioning": {
      "score": <0-100>,
      "differentiation": "<unique/incremental/unclear>",
      "demo_ready": "<can the investor visualize it>",
      "moat": "<defensibility assessment>",
      "suggestions": ["<improvements>"]
    },
    "market_sizing": {
      "score": <0-100>,
      "approach": "<top-down/bottom-up/missing>",
      "tam_sam_som": "<present/partial/missing>",
      "credibility": "<believable/inflated/underscoped>",
      "suggestions": ["<how to make market case stronger>"]
    },
    "traction_proof": {
      "score": <0-100>,
      "metrics_quality": "<strong/moderate/weak/missing>",
      "growth_rate": "<impressive/steady/unclear>",
      "social_proof": ["<notable customers, partners, press>"],
      "suggestions": ["<what metrics to highlight>"]
    },
    "business_model": {
      "score": <0-100>,
      "clarity": "<clear/complex/missing>",
      "unit_economics": "<present/implied/missing>",
      "scalability": "<obvious/questionable/unclear>",
      "suggestions": ["<improvements>"]
    },
    "team_credibility": {
      "score": <0-100>,
      "founder_market_fit": "<strong/moderate/weak>",
      "relevant_experience": "<directly relevant/adjacent/unrelated>",
      "suggestions": ["<how to position team better>"]
    },
    "the_ask": {
      "score": <0-100>,
      "clarity": "<specific/vague/missing>",
      "use_of_funds": "<detailed/vague/missing>",
      "milestone_alignment": "<funds tied to clear milestones?>",
      "suggestions": ["<how to frame the ask better>"]
    }
  },
  "suggestions": ["<top 5 highest-impact changes to improve fundability>"],
  "rewrite": "<rewritten opening 2-3 slides showing how to hook investors immediately>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<relevant excerpt>"}
  ],
  "investor_objections": ["<top 3-5 questions an investor WILL ask — prepare answers>"],
  "fundability_assessment": "<not ready / needs work / competitive / strong>"
}

IMPORTANT RULES:
- Think like a VC partner at a Monday meeting deciding in 30 seconds whether to keep listening
- Narrative > data. A great story with decent data beats great data with no story
- Flag vanity metrics (registered users, page views) — reward revenue, retention, growth rate
- TAM/SAM/SOM must be bottom-up to be credible. "$150B market" with no wedge = red flag
- The first 30 seconds (first 2 slides) determine everything — score the hook heavily
- Penalize decks that are "feature lists" instead of stories
- Flag missing slides (competition, go-to-market, use of funds) as critical gaps
- "We have no competition" is ALWAYS a red flag
- Team slide without founder-market fit explanation = missed opportunity
- The ask should tie directly to specific milestones and runway`,

  outputSchema: [
    { key: "score", label: "Fundability Score", type: "score", description: "0-100 investment readiness" },
    { key: "details.narrative_arc", label: "Narrative Arc", type: "score", description: "Story flow and hook" },
    { key: "details.problem_definition", label: "Problem", type: "score", description: "Problem clarity and urgency" },
    { key: "details.market_sizing", label: "Market Size", type: "score", description: "Market opportunity credibility" },
    { key: "details.traction_proof", label: "Traction", type: "score", description: "Proof of progress" },
    { key: "details.the_ask", label: "The Ask", type: "score", description: "Funding ask clarity" },
    { key: "suggestions", label: "Key Improvements", type: "list", description: "Highest-impact changes" },
    { key: "flags", label: "Red Flags", type: "flags", description: "Investor concerns" },
    { key: "rewrite", label: "Opening Rewrite", type: "rewrite", description: "Stronger opening slides" },
  ],

  scoringRubric: [
    { name: "Narrative Arc", weight: 0.2, description: "Compelling story, strong hook, logical flow" },
    { name: "Problem & Solution", weight: 0.2, description: "Clear problem, differentiated solution, defensible moat" },
    { name: "Market Opportunity", weight: 0.15, description: "Credible market sizing, clear wedge" },
    { name: "Traction & Proof", weight: 0.2, description: "Real metrics, growth rate, social proof" },
    { name: "Business Model", weight: 0.1, description: "Clear monetization, unit economics" },
    { name: "Team & Ask", weight: 0.15, description: "Founder-market fit, specific funding use" },
  ],
};
