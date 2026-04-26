import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Use service role for webhook operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const subscription = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const customerId = subscription.customer as string
      const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'canceled' ? 'canceled' :
        subscription.status === 'past_due' ? 'past_due' : 'free'

      await supabase
        .from('profiles')
        .update({
          subscription_status: status,
          subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)
      break
    }
    case 'customer.subscription.deleted': {
      const customerId = subscription.customer as string
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
