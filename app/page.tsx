import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Shield, BarChart3, ArrowRight, Check } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Grok App</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <Badge className="mb-4">Powered by Grok AI</Badge>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              AI-Powered Structured Scans for Any Text
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Extract structured insights, summaries, and actionable data from any text using the power of Grok AI.
              Built for developers, analysts, and businesses.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Start for Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Fast Structured Scans</h3>
                <p className="text-muted-foreground">
                  Get structured JSON output from any text in seconds using Grok&apos;s powerful AI.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your data is protected with Supabase Row Level Security. Only you can access your scans.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Scan History</h3>
                <p className="text-muted-foreground">
                  All your scans are saved automatically. Search, filter, and revisit past results anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="p-6 bg-card rounded-lg border border-border flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Free</h3>
                  <div className="text-3xl font-bold mt-2">$0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                  {['10 scans/month', 'Basic scan types', 'Scan history (7 days)'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-auto">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
              <div className="p-6 bg-primary text-primary-foreground rounded-lg flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Pro</h3>
                  <div className="text-3xl font-bold mt-2">$29<span className="text-base font-normal opacity-70">/mo</span></div>
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                  {['Unlimited scans', 'All scan types', 'Unlimited history', 'Priority processing', 'API access'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="mt-auto">
                  <Button variant="secondary" className="w-full">Start Free Trial</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Grok App. Powered by xAI Grok.
        </div>
      </footer>
    </div>
  )
}
