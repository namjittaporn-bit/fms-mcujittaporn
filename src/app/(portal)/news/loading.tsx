export default function NewsLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8 space-y-10">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-36 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-72 rounded-lg bg-muted animate-pulse sm:w-96" />
        <div className="h-4 w-full max-w-xl rounded-md bg-muted animate-pulse" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
        <div className="h-8 w-full sm:w-72 rounded-full bg-muted animate-pulse" />
      </div>

      {/* News Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
          >
            {/* Image Placeholder */}
            <div className="h-48 w-full bg-muted animate-pulse" />

            {/* Content Placeholder */}
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="h-5 w-3/4 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-2/3 rounded-md bg-muted animate-pulse" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
