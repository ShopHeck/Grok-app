export default function TemplatesLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded mt-2" />
        </div>
        <div className="h-9 w-40 bg-muted rounded" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 w-full bg-muted rounded" />

      {/* Category pills skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-muted rounded-full" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
