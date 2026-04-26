import OpenAI from 'openai'
import { z } from 'zod'

function getGrokClient(): OpenAI {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not set')
  }
  return new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  })
}

export const GROK_MODEL = 'grok-3'

export const ScanResultSchema = z.object({
  summary: z.string().describe('A concise summary of the input text'),
  key_points: z.array(z.string()).describe('List of key points extracted from the text'),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('Overall sentiment'),
  entities: z.array(z.object({
    name: z.string(),
    type: z.enum(['person', 'organization', 'location', 'product', 'other']),
  })).describe('Named entities found in the text'),
  topics: z.array(z.string()).describe('Main topics covered in the text'),
  action_items: z.array(z.string()).describe('Actionable items if any'),
  word_count: z.number().describe('Approximate word count'),
  language: z.string().describe('Detected language'),
})

export type ScanResult = z.infer<typeof ScanResultSchema>

export const SCAN_TYPES = {
  general: 'General Analysis',
  sentiment: 'Sentiment Analysis',
  entities: 'Entity Extraction',
  summary: 'Summarization',
  topics: 'Topic Modeling',
} as const

export type ScanType = keyof typeof SCAN_TYPES

export async function runScan(inputText: string, scanType: ScanType): Promise<ScanResult> {
  const grok = getGrokClient()
  const systemPrompts: Record<ScanType, string> = {
    general: 'You are an expert text analyst. Analyze the provided text and extract structured information.',
    sentiment: 'You are a sentiment analysis expert. Focus on emotional tone, sentiment indicators, and opinion mining.',
    entities: 'You are an NLP expert specializing in named entity recognition. Focus on identifying and classifying all entities.',
    summary: 'You are an expert summarizer. Focus on concise summaries and key points extraction.',
    topics: 'You are a topic modeling expert. Focus on identifying themes, topics, and categories.',
  }

  const response = await grok.chat.completions.create({
    model: GROK_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompts[scanType] + '\n\nRespond ONLY with valid JSON matching the requested schema.',
      },
      {
        role: 'user',
        content: `Analyze the following text and return a JSON object with these fields:
- summary: string (concise summary)
- key_points: string[] (list of key points)
- sentiment: "positive" | "negative" | "neutral" | "mixed"
- entities: { name: string, type: "person" | "organization" | "location" | "product" | "other" }[]
- topics: string[]
- action_items: string[]
- word_count: number
- language: string

Text to analyze:
"""
${inputText}
"""`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from Grok API')

  const parsed = JSON.parse(content)
  return ScanResultSchema.parse(parsed)
}
