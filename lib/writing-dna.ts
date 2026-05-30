/**
 * Writing DNA — Personal AI Tuning types and utilities.
 * Builds a user's unique writing profile from their analysis history.
 */

export interface WritingDNA {
  userId: string;
  /** Minimum analyses required before DNA is generated */
  analysisCount: number;
  /** When the profile was last computed */
  lastUpdated: string;
  /** Detected writing characteristics */
  voice: VoiceProfile;
  /** Per-agent performance patterns */
  agentPatterns: Record<string, AgentPattern>;
  /** User's custom scoring preferences */
  scoringPreferences: ScoringPreferences;
  /** Industry/vertical calibration */
  industry: IndustryCalibration | null;
}

export interface VoiceProfile {
  /** Dominant tone: casual, professional, academic, conversational */
  tone: string;
  /** Average sentence length in words */
  avgSentenceLength: number;
  /** Vocabulary complexity: simple, moderate, advanced */
  vocabularyLevel: string;
  /** Formality score 0-100 */
  formalityScore: number;
  /** Common patterns and phrases */
  signaturePhrases: string[];
  /** Preferred structure patterns */
  structurePreference: string;
  /** Emoji usage frequency: never, rare, moderate, frequent */
  emojiUsage: string;
  /** Active vs passive voice ratio */
  activeVoiceRatio: number;
}

export interface AgentPattern {
  agentId: string;
  totalAnalyses: number;
  avgScore: number;
  bestScore: number;
  /** Common weak areas for this user on this agent */
  weakAreas: string[];
  /** Areas where user consistently scores well */
  strongAreas: string[];
  /** Score improvement rate (points per 10 analyses) */
  improvementRate: number;
}

export interface ScoringPreferences {
  /** User-defined weight overrides per rubric criterion */
  rubricWeights: Record<string, number> | null;
  /** Priority: brevity, persuasion, clarity, personality */
  priorities: string[];
  /** Strictness level: lenient, balanced, strict */
  strictness: "lenient" | "balanced" | "strict";
}

export interface IndustryCalibration {
  /** User's industry vertical */
  industry: string;
  /** Sub-sector for more specific norms */
  subSector: string | null;
  /** Audience type: b2b, b2c, internal, technical */
  audienceType: string;
  /** Adjustments to scoring based on industry norms */
  normAdjustments: Record<string, number>;
}

export const INDUSTRIES = [
  { id: "saas", label: "SaaS / Software", subSectors: ["B2B", "B2C", "DevTools", "Enterprise"] },
  { id: "ecommerce", label: "E-commerce / DTC", subSectors: ["Fashion", "Food", "Electronics", "Luxury"] },
  { id: "fintech", label: "Fintech / Finance", subSectors: ["Banking", "Crypto", "Insurance", "Investing"] },
  { id: "healthcare", label: "Healthcare / Biotech", subSectors: ["Digital Health", "Pharma", "Med Devices"] },
  { id: "agency", label: "Agency / Consulting", subSectors: ["Marketing", "Design", "Dev", "Strategy"] },
  { id: "education", label: "Education / EdTech", subSectors: ["K-12", "Higher Ed", "Corporate Training"] },
  { id: "media", label: "Media / Publishing", subSectors: ["News", "Creator Economy", "Entertainment"] },
  { id: "recruiting", label: "Recruiting / HR", subSectors: ["Tech", "Executive", "Staffing"] },
  { id: "real-estate", label: "Real Estate", subSectors: ["Residential", "Commercial", "PropTech"] },
  { id: "other", label: "Other", subSectors: [] },
] as const;

export const STRICTNESS_LEVELS = [
  { id: "lenient", label: "Lenient", description: "Focuses on big wins, ignores minor issues" },
  { id: "balanced", label: "Balanced", description: "Standard scoring (default)" },
  { id: "strict", label: "Strict", description: "Scores harshly, catches everything" },
] as const;

/** Minimum analyses before Writing DNA can be generated */
export const MIN_ANALYSES_FOR_DNA = 15;

/** Generate system prompt addendum from Writing DNA */
export function buildDNAPromptAddendum(dna: WritingDNA): string {
  const parts: string[] = [];

  parts.push("## USER'S WRITING PROFILE (personalize your analysis and rewrite)");

  if (dna.voice) {
    parts.push(`- Tone: ${dna.voice.tone}`);
    parts.push(`- Avg sentence length: ${dna.voice.avgSentenceLength} words`);
    parts.push(`- Vocabulary: ${dna.voice.vocabularyLevel}`);
    parts.push(`- Formality: ${dna.voice.formalityScore}/100`);
    parts.push(`- Active voice ratio: ${Math.round(dna.voice.activeVoiceRatio * 100)}%`);
    if (dna.voice.signaturePhrases.length > 0) {
      parts.push(`- Signature style elements: ${dna.voice.signaturePhrases.join(", ")}`);
    }
  }

  if (dna.industry) {
    parts.push(`\n## INDUSTRY CONTEXT`);
    parts.push(`- Industry: ${dna.industry.industry}`);
    if (dna.industry.subSector) parts.push(`- Sub-sector: ${dna.industry.subSector}`);
    parts.push(`- Audience: ${dna.industry.audienceType}`);
    parts.push(`- Calibrate your scoring to ${dna.industry.industry} norms (what works in this space may differ from general best practices)`);
  }

  if (dna.scoringPreferences) {
    parts.push(`\n## SCORING PREFERENCES`);
    parts.push(`- Strictness: ${dna.scoringPreferences.strictness}`);
    if (dna.scoringPreferences.priorities.length > 0) {
      parts.push(`- User priorities (weight these higher): ${dna.scoringPreferences.priorities.join(", ")}`);
    }
  }

  parts.push(`\n## REWRITE INSTRUCTIONS`);
  parts.push(`- Match the user's natural voice (tone, sentence length, vocabulary level)`);
  parts.push(`- Preserve their formality level and style patterns`);
  parts.push(`- Improve the content while sounding like THEM, not like a generic AI`);

  return parts.join("\n");
}
