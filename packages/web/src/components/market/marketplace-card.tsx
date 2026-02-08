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
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white pb-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#2d3a54] dark:bg-[#1b2537]"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${listing.imageUrl}")` }}
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex translate-y-4 transform items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl transition-transform group-hover:translate-y-0">
            <span className="material-symbols-outlined">visibility</span> Quick Preview
          </span>
        </div>
        {/* Premium Badge */}
        {listing.isPremium && (
          <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Premium
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-1">
        {/* Title and Rating */}
        <div className="mb-1 flex items-start justify-between">
          <h3 className="text-base font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white">
            {listing.title}
          </h3>
          <div className="flex items-center gap-0.5 text-amber-500">
            <span className="material-symbols-outlined !text-[14px]">star</span>
            <span className="text-xs font-bold">{listing.rating}</span>
          </div>
        </div>

        {/* Creator */}
        <p className="mb-3 text-sm text-slate-500 dark:text-[#92a4c9]">
          by <span className="cursor-pointer transition-colors hover:text-primary">{listing.creator.name || "Unknown"}</span>
        </p>

        {/* Price and Cart */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined !text-[18px] text-primary">monetization_on</span>
            <span className="font-bold text-slate-900 dark:text-white">{listing.priceAicc} AICC</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
