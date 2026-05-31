import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', appUrl))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(new URL('/settings', appUrl))
  }

  const stripe = getStripe()

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    })

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (error) {
    console.error('[portal] Failed to create billing portal session:', error)
    return NextResponse.redirect(new URL('/settings?error=portal_failed', appUrl))
  }
}
