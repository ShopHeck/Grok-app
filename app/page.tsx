import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agents } from "@/lib/agents";
import { PLAN_LIMITS } from "@/lib/agents/types";
import {
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  Users,
  Lock,
  Chrome,
  Flame,
  Share2,
  TrendingUp,
  MessageSquare,
  GitCompareArrows,
  BookOpen,
  Webhook,
} from "lucide-react";
import { PricingToggle } from "@/components/pricing-toggle";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AgentDesk</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#agents" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              Agents
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              Pricing
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto text-center max-w-4xl relative">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Now with Chrome Extension
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Specialized AI Agents
              <br />
              for Every Business Task
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              One platform, 15 AI experts. Grade cold emails, optimize
              newsletters, review contracts, score pitch decks — right from your
              browser. Get structured scores and actionable rewrites instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 text-base px-8">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#agents">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Explore Agents
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required &middot; 10 free analyses per month &middot; Chrome extension included
            </p>
          </div>
        </section>

        {/* Agent Showcase */}
        <section id="agents" className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">
                Your AI Agent Toolkit
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Each agent is purpose-built for a specific task. Pick the right
                one, paste your content, and get expert-level analysis in
                seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex flex-col gap-4 p-6 bg-card rounded-xl border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{agent.icon}</span>
                    {agent.tier !== "free" && (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        <Lock className="h-2.5 w-2.5 mr-1" />
                        {agent.tier}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {agent.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                    {agent.scoringRubric.slice(0, 3).map((criteria) => (
                      <Badge
                        key={criteria.name}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {criteria.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              {/* Coming Soon placeholder */}
              <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/50 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  More Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground">
                  New agents ship every month. Request one at launch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chrome Extension */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4" variant="outline">
                  <Chrome className="h-3 w-3 mr-1" />
                  Chrome Extension
                </Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Score your writing without leaving the page
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Right-click any text in Gmail, LinkedIn, or Google Docs to get
                  an instant AI score. No copy-pasting, no tab switching.
                </p>
                <ul className="flex flex-col gap-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    Auto-detects Gmail compose → Cold Email Grader
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    Auto-detects LinkedIn post → Social Post Optimizer
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    Floating score badge with one-click rewrite
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    3 free extension analyses per week
                  </li>
                </ul>
                <Button size="lg" className="gap-2">
                  <Chrome className="h-4 w-4" /> Add to Chrome — Free
                </Button>
              </div>
              <div className="bg-muted/50 rounded-xl border border-border p-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">87</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Great personalization!</p>
                    <p className="text-xs text-muted-foreground">Cold Email Grader • 3 suggestions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">62</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Hook needs work — too generic</p>
                    <p className="text-xs text-muted-foreground">Social Post Optimizer • 5 suggestions</p>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Results appear as a floating badge on any page
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold text-lg">Pick an Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from 15 specialized AI agents — or right-click in your
                  browser for auto-detection.
                </p>
              </div>
              <div className="text-center flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold text-lg">Paste Your Content</h3>
                <p className="text-sm text-muted-foreground">
                  Drop in your draft email, newsletter, contract, proposal, or
                  any business writing.
                </p>
              </div>
              <div className="text-center flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold text-lg">Get Expert Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a detailed score, specific issues, actionable
                  suggestions, and a full rewrite.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Built for Professionals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Structured Scores</h3>
                <p className="text-sm text-muted-foreground">
                  Every analysis returns a 0-100 score with detailed breakdowns
                  by category. Track improvement over time.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <Flame className="h-8 w-8 text-orange-500" />
                <h3 className="text-lg font-semibold">Writing Streaks</h3>
                <p className="text-sm text-muted-foreground">
                  Build consistency with daily streaks. Hit milestones to earn
                  bonus analyses and unlock Pro agents for free.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <Share2 className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Share & Embed</h3>
                <p className="text-sm text-muted-foreground">
                  Share your scores on social media with beautiful OG cards.
                  Embed score badges in your portfolio or email signature.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is protected with row-level security. Only you can
                  see your analyses. No training on your data.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <TrendingUp className="h-8 w-8 text-emerald-500" />
                <h3 className="text-lg font-semibold">Personal Bests</h3>
                <p className="text-sm text-muted-foreground">
                  Track your top score per agent. Get notified when you beat your
                  personal record. Watch your improvement over time.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6 bg-card rounded-lg border border-border">
                <Sparkles className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">AI Rewrites</h3>
                <p className="text-sm text-muted-foreground">
                  Every agent provides a complete rewrite — not just criticism,
                  but a better version you can use immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phase 2: Team & Workflow Features */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                For Teams & Power Users
              </Badge>
              <h2 className="text-3xl font-bold mb-3">
                From Tool to Workflow
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Collaborate with your team, connect your tools, share templates,
                and track improvement over time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Team Workspaces */}
              <div className="flex flex-col gap-4 p-6 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Team Workspaces</h3>
                    <Badge variant="outline" className="text-[10px] mt-0.5">Team Plan</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shared analysis history, team analytics dashboard, style guide
                  enforcement, and approval workflows. See your team&apos;s avg
                  score improve month over month.
                </p>
                <ul className="flex flex-col gap-1.5">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Member leaderboard & team analytics
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Brand voice & style guide enforcement
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Role-based access (Owner, Admin, Member, Viewer)
                  </li>
                </ul>
              </div>

              {/* Integrations */}
              <div className="flex flex-col gap-4 p-6 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Slack & API Integrations</h3>
                    <Badge variant="outline" className="text-[10px] mt-0.5">Team Plan</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Score text directly in Slack with <code className="text-xs bg-muted px-1 rounded">/agentdesk</code>.
                  Connect Zapier, Make, or your own tools with our REST API
                  and webhook callbacks.
                </p>
                <ul className="flex flex-col gap-1.5">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Slack slash command with 14 agent aliases
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    REST API with Bearer auth & callback URLs
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    1,000 API calls/month included in Team plan
                  </li>
                </ul>
              </div>

              {/* Templates */}
              <div className="flex flex-col gap-4 p-6 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Templates & Playbooks</h3>
                    <Badge variant="outline" className="text-[10px] mt-0.5">All Plans</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start from high-scoring community templates. Fork, customize,
                  and publish your own. Run multi-step playbooks that chain
                  agents into complete workflows.
                </p>
                <ul className="flex flex-col gap-1.5">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Community marketplace with ratings & categories
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    One-click fork to customize any template
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Multi-step playbooks (e.g., Launch Sequence)
                  </li>
                </ul>
              </div>

              {/* Before/After */}
              <div className="flex flex-col gap-4 p-6 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GitCompareArrows className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Before/After Comparison</h3>
                    <Badge variant="outline" className="text-[10px] mt-0.5">All Plans</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Iterate on your writing with one-click re-analysis. See
                  side-by-side diffs with change highlighting, score delta,
                  and shareable improvement cards.
                </p>
                <ul className="flex flex-col gap-1.5">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Word-level diff highlighting
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Version history with score progression
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    Shareable &ldquo;Score: 34 → 91&rdquo; cards for social
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Simple, Fair Pricing</h2>
              <p className="text-muted-foreground">
                Start free. Upgrade when you need more.
              </p>
            </div>
            <PricingToggle />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to level up your business writing?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join professionals who use AgentDesk to write better emails,
              newsletters, proposals, and contracts. Start for free on web or install
              the Chrome extension.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 text-base px-8">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                <Chrome className="h-4 w-4" /> Chrome Extension
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold">AgentDesk</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AgentDesk. Powered by xAI Grok.
          </p>
        </div>
      </footer>
    </div>
  );
}
