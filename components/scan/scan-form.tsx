'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SCAN_TYPES } from '@/lib/grok'
import { Loader2 } from 'lucide-react'

export function ScanForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [inputText, setInputText] = useState('')
  const [scanType, setScanType] = useState('general')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, inputText, scanType }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create scan')
      }

      const data = await res.json()
      router.push(`/scans/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Scan Title</Label>
        <Input
          id="title"
          placeholder="e.g., Product review analysis"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="scanType">Scan Type</Label>
        <Select value={scanType} onValueChange={setScanType}>
          <SelectTrigger>
            <SelectValue placeholder="Select scan type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SCAN_TYPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="inputText">Text to Analyze</Label>
        <Textarea
          id="inputText"
          placeholder="Paste or type the text you want to analyze..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          rows={10}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">{inputText.length} characters</p>
      </div>
      <Button type="submit" disabled={loading} className="gap-2">
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          'Run Scan'
        )}
      </Button>
    </form>
  )
}
