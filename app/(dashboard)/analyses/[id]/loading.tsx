import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnalysisDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back button */}
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-muted rounded animate-pulse" />
        <div className="flex flex-col gap-1.5">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Score overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-32 w-32 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-6 w-full max-w-md bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-5 w-36 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
