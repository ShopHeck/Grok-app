import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runScan, type ScanType } from '@/lib/grok'
import { z } from 'zod'

const CreateScanSchema = z.object({
  title: z.string().min(1).max(200),
  inputText: z.string().min(1).max(50000),
  scanType: z.enum(['general', 'sentiment', 'entities', 'summary', 'topics']),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = CreateScanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { title, inputText, scanType } = parsed.data

  // Create scan record
  const { data: scan, error: insertError } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      title,
      input_text: inputText,
      scan_type: scanType,
      status: 'processing',
    })
    .select()
    .single()

  if (insertError || !scan) {
    return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
  }

  // Run Grok scan
  try {
    const result = await runScan(inputText, scanType as ScanType)

    await supabase
      .from('scans')
      .update({ status: 'completed', result, updated_at: new Date().toISOString() })
      .eq('id', scan.id)

    return NextResponse.json({ id: scan.id, status: 'completed' }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scan processing failed'

    await supabase
      .from('scans')
      .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
      .eq('id', scan.id)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
