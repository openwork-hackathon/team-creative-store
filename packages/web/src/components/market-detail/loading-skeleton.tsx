export function LoadingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar skeleton */}
      <aside className="w-72 shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-6 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-12 w-full rounded bg-muted" />
          </div>
        </div>
      </aside>
      {/* Main content skeleton */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="animate-pulse p-6">
          <div className="h-8 w-1/3 rounded bg-muted" />
        </div>
      </main>
    </div>
  )
}
