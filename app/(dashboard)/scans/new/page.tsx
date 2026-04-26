import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScanForm } from '@/components/scan/scan-form'

export default function NewScanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Scan</h1>
        <p className="text-muted-foreground">Analyze text with Grok AI to extract structured insights</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Scan</CardTitle>
          <CardDescription>
            Provide the text you want to analyze and choose the scan type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScanForm />
        </CardContent>
      </Card>
    </div>
  )
}
