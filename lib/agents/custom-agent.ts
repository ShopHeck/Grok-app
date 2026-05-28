import { AgentConfig } from "./types";

export const customAgent: AgentConfig = {
  id: "custom",
  name: "Custom Agent",
  description:
    "Define your own analysis instructions. Use any prompt to analyze text exactly how you need.",
  icon: "✨",
  category: "custom",
  tier: "free",
  placeholder:
    "Paste the text you want to analyze...\n\nYou'll provide custom instructions for how to analyze it.",
  inputLabel: "Text to Analyze",
  maxInputLength: 50000,
  systemPrompt: `You are a highly capable text analysis assistant. The user will provide text along with custom instructions for how to analyze it.

Follow the user's instructions precisely. Return your analysis as a JSON response with this structure:
{
  "score": <0-100 quality/relevance score based on the user's criteria>,
  "summary": "<one sentence summary of your analysis>",
  "details": {
    "analysis": "<your detailed analysis following the user's instructions>",
    "key_findings": ["<main findings>"],
    "categories": {}
  },
  "suggestions": ["<actionable recommendations based on the analysis>"],
  "flags": [
    {"severity": "info|warning|critical", "message": "<notable finding>", "context": "<relevant excerpt>"}
  ]
}

IMPORTANT:
- Follow the user's custom instructions as closely as possible
- Structure your output clearly even if the instructions are vague
- Always provide a score, summary, and actionable suggestions
- Be thorough but concise`,

  outputSchema: [
    { key: "score", label: "Score", type: "score", description: "Overall quality score" },
    { key: "details.analysis", label: "Analysis", type: "text", description: "Detailed analysis" },
    { key: "details.key_findings", label: "Key Findings", type: "list", description: "Main findings" },
    { key: "suggestions", label: "Suggestions", type: "list", description: "Recommendations" },
    { key: "flags", label: "Flags", type: "flags", description: "Notable findings" },
  ],

  scoringRubric: [
    { name: "Relevance", weight: 0.4, description: "How well the analysis matches user instructions" },
    { name: "Thoroughness", weight: 0.3, description: "Completeness of the analysis" },
    { name: "Actionability", weight: 0.3, description: "Are suggestions useful and specific" },
  ],
};
