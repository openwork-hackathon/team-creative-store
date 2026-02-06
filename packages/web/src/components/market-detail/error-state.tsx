import { Link } from "@tanstack/react-router"

export function ErrorState() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
          <span className="material-symbols-outlined text-4xl text-muted-foreground">error</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">Listing Not Found</h3>
        <p className="mb-6 max-w-md text-muted-foreground">
          The creative listing you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/market"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Marketplace
        </Link>
      </div>
    </div>
  )
}
