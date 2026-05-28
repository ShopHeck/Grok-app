import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AgentDesk — AI Toolkit for Business Writing",
    template: "%s | AgentDesk",
  },
  description:
    "Specialized AI agents that grade cold emails, optimize product listings, review contracts, and analyze job posts. Get structured scores, actionable feedback, and AI rewrites in seconds.",
  keywords: [
    "AI writing assistant",
    "cold email grader",
    "listing optimizer",
    "contract reviewer",
    "job post analyzer",
    "AI agents",
    "business writing",
    "Grok AI",
  ],
  authors: [{ name: "AgentDesk" }],
  creator: "AgentDesk",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://agentdesk.ai"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AgentDesk",
    title: "AgentDesk — AI Toolkit for Business Writing",
    description:
      "One platform, multiple AI experts. Grade emails, optimize listings, review contracts, and analyze job posts with structured scores and AI rewrites.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentDesk — Specialized AI Agents for Every Business Task",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentDesk — AI Toolkit for Business Writing",
    description:
      "Specialized AI agents that score and rewrite your business writing. Try free.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
