import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardPageLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-36 bg-muted rounded animate-pulse" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-12 bg-muted rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent analyses */}
      <Card>
        <CardHeader>
          <div className="h-5 w-36 bg-muted rounded animate-pulse" />
          <div className="h-4 w-28 bg-muted rounded animate-pulse mt-1" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
