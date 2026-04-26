import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ScanResult } from '@/lib/grok'
import { MessageSquare, Tag, Users, Hash, CheckSquare, Globe, BarChart2 } from 'lucide-react'

interface ScanResultDisplayProps {
  result: ScanResult
}

const sentimentColors = {
  positive: 'bg-green-100 text-green-800',
  negative: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
  mixed: 'bg-yellow-100 text-yellow-800',
}

export function ScanResultDisplay({ result }: ScanResultDisplayProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" /> Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{result.summary}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sentimentColors[result.sentiment]}`}>
              {result.sentiment} sentiment
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> {result.language}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart2 className="h-3 w-3" /> ~{result.word_count} words
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Points */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" /> Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {result.key_points.map((point, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span> {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-4 w-4" /> Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.topics.map((topic, i) => (
                <Badge key={i} variant="secondary">{topic}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entities */}
      {result.entities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.entities.map((entity, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-sm">
                  <span className="font-medium">{entity.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">{entity.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {result.action_items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4" /> Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {result.action_items.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
