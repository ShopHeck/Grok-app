import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, User } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_status === 'active'

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Full Name</span>
            <span className="font-medium">{profile?.full_name ?? 'Not set'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{profile?.email ?? user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription
          </CardTitle>
          <CardDescription>Manage your plan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
              <p className="text-sm text-muted-foreground">
                {isPro ? 'Unlimited scans, all features' : '10 scans/month, basic features'}
              </p>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {profile?.subscription_status ?? 'free'}
            </Badge>
          </div>
          {isPro ? (
            <form action="/api/stripe/portal" method="POST">
              <Button type="submit" variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </form>
          ) : (
            <form action="/api/stripe/checkout" method="POST">
              <Button type="submit" className="w-full">
                Upgrade to Pro - $29/mo
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
