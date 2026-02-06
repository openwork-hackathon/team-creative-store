import { Link } from "@tanstack/react-router";
import type { MarketplaceListing } from "@/lib/api";

export interface MarketplaceCardProps {
  listing: MarketplaceListing;
}

export function MarketplaceCard({ listing }: MarketplaceCardProps) {
  return (
    <Link
      to="/market/$id"
      params={{ id: listing.id }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card pb-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${listing.imageUrl}")` }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex translate-y-4 transform items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl transition-transform group-hover:translate-y-0">
            <span className="material-symbols-outlined">visibility</span> View Details
          </span>
        </div>
        {listing.isPremium && (
          <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Premium
          </div>
        )}
      </div>
      <div className="px-4 py-1">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {listing.title}
          </h3>
          <div className="flex items-center gap-0.5 text-amber-500">
            <span className="material-symbols-outlined !text-[14px]">star</span>
            <span className="text-xs font-bold">{listing.rating}</span>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          by <span className="transition-colors hover:text-primary">{listing.creator.name}</span>
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined !text-[18px] text-primary">monetization_on</span>
            <span className="font-bold text-foreground">{listing.priceAicc} AICC</span>
          </div>
          <span className="rounded-full p-2 text-primary transition-colors group-hover:bg-primary/10">
            <span className="material-symbols-outlined">shopping_cart</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
