import type { MarketListing } from "./types"

interface PurchaseCardProps {
  listing: MarketListing
}

export function PurchaseCard({ listing }: PurchaseCardProps) {
  return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {listing.isPremium ? "Premium Assets" : "Creative Asset"}
          </span>
          <h1 className="text-lg font-bold text-foreground leading-tight">{listing.title}</h1>
        </div>

        <div className="flex items-end justify-between py-2 border-y border-border">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Current Price</p>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg">database</span>
              <span className="text-2xl font-black text-foreground">
                {Number(listing.priceAicc).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">AICC</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">
            ≈ ${(Number(listing.priceAicc) * 2.76).toFixed(2)}
          </p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Buy Now
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span>
            Certified Creator
          </span>
          <span>5.0% Royalty</span>
        </div>
      </div>
    </div>
  )
}
