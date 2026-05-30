import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chrome Extension Privacy Policy — AgentDesk",
  description:
    "Privacy policy for the AgentDesk Chrome Extension. Learn what data we access and how we protect your privacy.",
};

export default function ExtensionPrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">AgentDesk</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">
          Chrome Extension Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">
          Last updated: May 30, 2026
        </p>

        <div className="prose prose-sm max-w-none flex flex-col gap-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              The AgentDesk Chrome Extension (&ldquo;Extension&rdquo;) helps you
              analyze your writing directly in Gmail, LinkedIn, and Google Docs.
              This privacy policy explains what data the Extension accesses, how
              it&apos;s used, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              Data We Access
            </h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <strong>Selected text only:</strong> When you right-click and
                choose &ldquo;Analyze with AgentDesk&rdquo; or click the Score
                button, only the text you explicitly select or have in a compose
                window is sent for analysis. We never read or scan page content
                without your action.
              </li>
              <li>
                <strong>Authentication tokens:</strong> Your AgentDesk session
                token is stored locally in the browser (via{" "}
                <code>chrome.storage.local</code>) to keep you signed in. It is
                never shared with third parties.
              </li>
              <li>
                <strong>Usage metrics:</strong> We track how many analyses
                you&apos;ve run (for quota enforcement) and your streak count.
                No personal content is included in metrics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              Data We Do NOT Collect
            </h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>We do not read your emails, messages, or documents passively</li>
              <li>We do not collect browsing history or page URLs</li>
              <li>We do not inject ads or tracking pixels</li>
              <li>We do not sell or share data with advertisers</li>
              <li>We do not train AI models on your content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              How Text Is Processed
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When you submit text for analysis, it is sent securely (HTTPS) to
              the AgentDesk API, processed by our AI (powered by xAI Grok), and
              the result is returned to the Extension. Your text is stored in your
              personal analysis history (accessible only to you) and is never
              used to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              Permissions Explained
            </h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <strong>mail.google.com:</strong> To add the &ldquo;Score
                Email&rdquo; button in Gmail compose windows
              </li>
              <li>
                <strong>linkedin.com:</strong> To add the &ldquo;Score
                Post&rdquo; button in LinkedIn post composers
              </li>
              <li>
                <strong>docs.google.com:</strong> To enable right-click analysis
                of selected text in Google Docs
              </li>
              <li>
                <strong>agentdesk.app:</strong> To securely sync your login
                session between the web app and extension
              </li>
              <li>
                <strong>contextMenus:</strong> To show the &ldquo;Analyze with
                AgentDesk&rdquo; option when you right-click selected text
              </li>
              <li>
                <strong>storage:</strong> To store your session token and
                preferences locally in the browser
              </li>
              <li>
                <strong>alarms:</strong> To periodically sync usage data and
                check streak status
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              Data Retention & Deletion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Analysis history is retained according to your plan (7 days for
              free, unlimited for paid plans). You can delete any analysis from
              your dashboard at any time. Uninstalling the extension removes all
              locally stored data. To delete your account and all associated
              data, contact support@agentdesk.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about this policy? Email us at{" "}
              <a href="mailto:privacy@agentdesk.app" className="text-primary hover:underline">
                privacy@agentdesk.app
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
