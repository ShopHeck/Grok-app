import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ScanText, Clock, CheckCircle2, XCircle } from 'lucide-react'

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed': return 'default'
    case 'processing': return 'secondary'
    case 'failed': return 'destructive'
    default: return 'outline'
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: scans } = await supabase
    .from('scans')
    .select('id, title, scan_type, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalScans } = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: completedScans } = await supabase
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your AI-powered scans</p>
        </div>
        <Link href="/scans/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Scan
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Scans</CardDescription>
            <CardTitle className="text-3xl">{totalScans ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ScanText className="h-4 w-4" /> All time
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{completedScans ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" /> Successfully processed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl">{(totalScans ?? 0) - (completedScans ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" /> Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest AI analysis results</CardDescription>
            </div>
            <Link href="/scans">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!scans || scans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScanText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No scans yet. <Link href="/scans/new" className="text-primary hover:underline">Create your first scan</Link></p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {scans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/scans/${scan.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{scan.title}</span>
                    <span className="text-xs text-muted-foreground capitalize">{scan.scan_type} • <Clock className="inline h-3 w-3" /> {new Date(scan.created_at).toLocaleDateString()}</span>
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
