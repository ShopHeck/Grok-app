import { AgentConfig } from "./types";

export const jobPostAnalyzer: AgentConfig = {
  id: "job-post-analyzer",
  name: "Job Post Analyzer",
  description:
    "Optimize job descriptions for inclusivity, clarity, and applicant quality. Attract better candidates.",
  icon: "🧑‍💼",
  category: "business",
  tier: "pro",
  placeholder:
    "Paste your job posting here...\n\nInclude the title, requirements, responsibilities, and any other details.",
  inputLabel: "Job Description",
  maxInputLength: 15000,
  exampleInput: `Senior Full-Stack Developer (Rockstar Needed!)

We're looking for a coding ninja who can crush it in our fast-paced startup. Must be a 10x developer who eats code for breakfast.

Requirements:
- 8+ years experience with React, Node.js, and AWS
- CS degree from top-tier university required
- Must be able to work under pressure and meet tight deadlines
- Available for on-call 24/7
- Young and energetic team player

Responsibilities:
- Build stuff
- Fix bugs
- Attend meetings

We offer competitive salary (DOE) and unlimited PTO.`,
  systemPrompt: `You are an expert in talent acquisition, DEI (Diversity, Equity & Inclusion), and employer branding. You've helped 500+ companies rewrite job postings that increased qualified applicant volume by 40%+ while improving diversity.

Analyze the provided job posting and return a JSON response with this EXACT structure:
{
  "score": <0-100 overall job posting quality>,
  "summary": "<one sentence verdict>",
  "details": {
    "inclusivity": {
      "score": <0-100>,
      "gendered_language": ["<gendered terms found>"],
      "exclusionary_requirements": ["<unnecessarily restrictive requirements>"],
      "age_bias": ["<age-biased language>"],
      "suggestions": ["<inclusive alternatives>"]
    },
    "clarity": {
      "score": <0-100>,
      "vague_responsibilities": ["<unclear items>"],
      "missing_info": ["<what candidates need to know>"],
      "jargon": ["<unnecessary jargon>"],
      "suggestions": ["<clarity improvements>"]
    },
    "requirements": {
      "score": <0-100>,
      "inflated": ["<requirements that seem inflated>"],
      "reasonable": ["<well-calibrated requirements>"],
      "missing": ["<skills you'd expect for this role>"],
      "suggestions": ["<how to right-size requirements>"]
    },
    "compensation_transparency": {
      "score": <0-100>,
      "salary_listed": <true/false>,
      "benefits_clarity": "<clear/vague/missing>",
      "suggestions": ["<transparency improvements>"]
    },
    "employer_brand": {
      "score": <0-100>,
      "culture_signals": ["<what this says about company culture>"],
      "red_flags_for_candidates": ["<things that would scare off good candidates>"],
      "suggestions": ["<brand improvements>"]
    },
    "seo_and_reach": {
      "score": <0-100>,
      "title_effectiveness": "<assessment>",
      "searchability": "<low/medium/high>",
      "suggestions": ["<how to improve discoverability>"]
    }
  },
  "suggestions": ["<top 5 highest-impact changes>"],
  "rewrite": "<complete rewritten job posting>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<excerpt from posting>"}
  ],
  "legal_risks": ["<any language that could create legal liability>"],
  "estimated_impact": "<X% more qualified applicants with suggested changes>"
}

IMPORTANT RULES:
- Flag "bro culture" language aggressively (ninja, rockstar, crush it, etc.)
- "CS degree required" when not necessary is a critical inclusivity flag
- Years of experience requirements over 5 years are almost always inflated
- "Competitive salary" with no range is always a warning
- "Unlimited PTO" without context is a red flag for candidates
- 24/7 availability requirements are critical flags
- Score harshly — most job postings are exclusionary and vague
- The rewrite should demonstrate what a truly excellent job posting looks like
- Consider that women apply to jobs when they meet 100% of requirements, men at 60%`,

  outputSchema: [
    { key: "score", label: "Overall Score", type: "score", description: "0-100 posting quality" },
    { key: "details.inclusivity", label: "Inclusivity", type: "score", description: "Bias and inclusivity" },
    { key: "details.clarity", label: "Clarity", type: "score", description: "How clear the posting is" },
    { key: "details.requirements", label: "Requirements", type: "score", description: "Are requirements reasonable" },
    { key: "details.compensation_transparency", label: "Compensation", type: "score", description: "Pay transparency" },
    { key: "details.employer_brand", label: "Employer Brand", type: "score", description: "How you come across" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Priority changes" },
    { key: "flags", label: "Issues", type: "flags", description: "Problems found" },
    { key: "rewrite", label: "Rewritten Posting", type: "rewrite", description: "Optimized version" },
  ],

  scoringRubric: [
    { name: "Inclusivity", weight: 0.25, description: "Gender-neutral, no unnecessary barriers" },
    { name: "Clarity", weight: 0.2, description: "Clear responsibilities and expectations" },
    { name: "Requirements", weight: 0.2, description: "Right-sized, not inflated" },
    { name: "Compensation", weight: 0.15, description: "Transparent pay and benefits" },
    { name: "Employer Brand", weight: 0.1, description: "Authentic, appealing culture signals" },
    { name: "SEO/Reach", weight: 0.1, description: "Discoverable title and keywords" },
  ],
};
