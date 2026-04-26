import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScanResultDisplay } from '@/components/scan/scan-result'
import { ArrowLeft, Clock, ScanText } from 'lucide-react'
import type { ScanResult } from '@/lib/grok'

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed': return 'default'
    case 'processing': return 'secondary'
    case 'failed': return 'destructive'
    default: return 'outline'
  }
}

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!scan) notFound()

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/scans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{scan.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ScanText className="h-3 w-3" />
            <span className="capitalize">{scan.scan_type}</span>
            <Clock className="h-3 w-3 ml-1" />
            <span>{new Date(scan.created_at).toLocaleString()}</span>
          </div>
        </div>
        <Badge variant={statusVariant(scan.status)}>{scan.status}</Badge>
      </div>

      {/* Input Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input Text</CardTitle>
          <CardDescription>{scan.input_text.length} characters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap line-clamp-6">{scan.input_text}</p>
        </CardContent>
      </Card>

      {/* Results */}
      {scan.status === 'completed' && scan.result && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
          <ScanResultDisplay result={scan.result as ScanResult} />
        </div>
      )}

      {scan.status === 'failed' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Scan Failed</CardTitle>
            <CardDescription>{scan.error_message ?? 'An unknown error occurred'}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {(scan.status === 'pending' || scan.status === 'processing') && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Processing your scan...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
