import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grok App - AI-Powered Structured Scans',
  description: 'Analyze and extract structured insights from any text using Grok AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
