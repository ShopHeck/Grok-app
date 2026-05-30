import { AgentConfig } from "./types";

export const technicalDocsReviewer: AgentConfig = {
  id: "technical-docs-reviewer",
  name: "Technical Docs Reviewer",
  description:
    "Analyze API docs, README files, knowledge base articles, or product docs for clarity, completeness, developer experience, and accessibility.",
  icon: "🎓",
  category: "writing",
  tier: "pro",
  placeholder:
    "Paste your documentation here...\n\nWorks with:\n- API documentation\n- README files\n- Knowledge base articles\n- Developer guides\n- Product documentation\n- Tutorial content",
  inputLabel: "Documentation Content",
  maxInputLength: 50000,

  exampleInput: `# PayFlow API

## Getting Started

To use our API, you need to get an API key. Contact sales for access.

## Authentication

Use your API key in the header.

## Endpoints

### Create Payment

POST /api/payments

Creates a payment. Send the payment data in the body.

Parameters:
- amount: the amount
- currency: the currency
- customer_id: customer ID

Response:
Returns a payment object.

### Get Payment

GET /api/payments/:id

Gets a payment by ID.

## Errors

If something goes wrong, you'll get an error response.

## Rate Limits

Don't send too many requests.`,
  systemPrompt: `You are a technical writing expert and developer experience (DX) specialist who has written documentation for Stripe, Twilio, and Vercel. You know that great docs are the #1 driver of developer adoption and that poor docs are the #1 reason developers abandon tools.

Analyze the provided documentation and return a JSON response with this EXACT structure:
{
  "score": <0-100 documentation quality score>,
  "summary": "<one sentence verdict>",
  "details": {
    "clarity": {
      "score": <0-100>,
      "readability": "<clear/moderate/confusing>",
      "jargon_level": "<appropriate/too much/inconsistent>",
      "sentence_complexity": "<simple/moderate/complex>",
      "ambiguous_sections": ["<sections that could confuse readers>"],
      "suggestions": ["<clarity improvements>"]
    },
    "completeness": {
      "score": <0-100>,
      "missing_sections": ["<expected sections not present>"],
      "gaps": ["<questions a reader would have that aren't answered>"],
      "edge_cases_covered": <true/false>,
      "error_handling_documented": <true/false>,
      "suggestions": ["<what to add>"]
    },
    "code_examples": {
      "score": <0-100>,
      "present": <true/false>,
      "runnable": "<copy-paste ready/needs modification/broken>",
      "language_coverage": ["<languages shown>"],
      "progressive_complexity": <true/false>,
      "suggestions": ["<code example improvements>"]
    },
    "structure": {
      "score": <0-100>,
      "hierarchy": "<logical/disorganized/flat>",
      "navigation": "<easy to scan/difficult/no structure>",
      "progressive_disclosure": "<simple to complex/all at once/random>",
      "suggestions": ["<structural improvements>"]
    },
    "developer_experience": {
      "score": <0-100>,
      "time_to_first_success": "<fast/moderate/slow/impossible from docs alone>",
      "quickstart_present": <true/false>,
      "authentication_clear": <true/false>,
      "copy_paste_friendly": <true/false>,
      "suggestions": ["<DX improvements>"]
    },
    "accuracy_signals": {
      "score": <0-100>,
      "version_mentioned": <true/false>,
      "last_updated": "<mentioned/missing>",
      "deprecated_content_risk": "<low/medium/high/unknown>",
      "suggestions": ["<accuracy improvements>"]
    },
    "accessibility": {
      "score": <0-100>,
      "beginner_friendly": <true/false>,
      "assumes_knowledge": ["<prerequisite knowledge not stated>"],
      "alt_text_for_visuals": "<present/missing/no visuals>",
      "suggestions": ["<accessibility improvements>"]
    }
  },
  "suggestions": ["<top 5 highest-impact improvements>"],
  "rewrite": "<rewritten version of the weakest section, showing best practices>",
  "flags": [
    {"severity": "info|warning|critical", "message": "<issue>", "context": "<relevant excerpt>"}
  ],
  "dx_grade": "<F/D/C/B/A — overall developer experience letter grade>",
  "missing_essentials": ["<critical sections every good doc needs that are absent>"]
}

IMPORTANT RULES:
- "Contact sales for access" in a quickstart = instant developer abandonment — critical flag
- Every API endpoint MUST have: description, parameters with types, example request, example response
- "Returns a payment object" without showing the object = useless documentation
- "Don't send too many requests" without actual numbers = critical incompleteness
- Parameters without types, required/optional status, and defaults are incomplete
- No code examples = docs are theoretical — most developers learn by example
- Authentication section must have a working curl/code example, not just prose
- Error responses need actual error codes, messages, and troubleshooting steps
- Great docs have a "time to first API call" under 5 minutes
- Missing: quickstart, changelog, rate limit numbers, SDKs, webhook docs = flag
- Docs that say "the amount" for a parameter description are circular and useless
- Score as if you're a developer at 11pm trying to ship a feature by morning`,

  outputSchema: [
    { key: "score", label: "Docs Score", type: "score", description: "0-100 documentation quality" },
    { key: "details.clarity", label: "Clarity", type: "score", description: "Readability and precision" },
    { key: "details.completeness", label: "Completeness", type: "score", description: "Coverage of all topics" },
    { key: "details.code_examples", label: "Code Examples", type: "score", description: "Working, relevant examples" },
    { key: "details.structure", label: "Structure", type: "score", description: "Organization and navigation" },
    { key: "details.developer_experience", label: "DX", type: "score", description: "Time to first success" },
    { key: "suggestions", label: "Improvements", type: "list", description: "Highest-impact fixes" },
    { key: "flags", label: "Issues", type: "flags", description: "Documentation gaps" },
    { key: "rewrite", label: "Rewritten Section", type: "rewrite", description: "Best-practice example" },
  ],

  scoringRubric: [
    { name: "Clarity", weight: 0.2, description: "Clear language, no ambiguity, appropriate jargon" },
    { name: "Completeness", weight: 0.25, description: "All sections present, edge cases, errors documented" },
    { name: "Code Examples", weight: 0.2, description: "Runnable examples, multiple languages, progressive" },
    { name: "Structure", weight: 0.15, description: "Logical hierarchy, scannable, progressive disclosure" },
    { name: "Developer Experience", weight: 0.2, description: "Quick start, copy-paste ready, time to success" },
  ],
};
