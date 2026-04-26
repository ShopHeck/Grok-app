import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ScanText, Clock } from 'lucide-react'

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed': return 'default'
    case 'processing': return 'secondary'
    case 'failed': return 'destructive'
    default: return 'outline'
  }
}

export default async function ScansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: scans } = await supabase
    .from('scans')
    .select('id, title, scan_type, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scans</h1>
          <p className="text-muted-foreground">All your AI-powered text analyses</p>
        </div>
        <Link href="/scans/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Scan
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scans</CardTitle>
          <CardDescription>{scans?.length ?? 0} total scans</CardDescription>
        </CardHeader>
        <CardContent>
          {!scans || scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScanText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">No scans yet</p>
              <p className="text-sm mb-4">Start by creating your first AI-powered text analysis</p>
              <Link href="/scans/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Scan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {scans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/scans/${scan.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{scan.title}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 capitalize">
                      {scan.scan_type} • <Clock className="h-3 w-3" /> {new Date(scan.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant={statusVariant(scan.status)}>{scan.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
