import type { MarketListing } from "./types"

interface PhonePreviewProps {
  listing: MarketListing
}

export function PhonePreview({ listing }: PhonePreviewProps) {
  return (
    <div
      className="flex-1 overflow-auto flex items-center justify-center p-12 relative"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Phone Frame */}
      <div
        className="relative shadow-[0_0_100px_rgba(0,0,0,0.3)] rounded-[48px] border-[14px] border-slate-900 bg-black overflow-hidden flex flex-col"
        style={{ width: "400px", height: "820px" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-slate-900 rounded-b-3xl z-30 flex items-center justify-center gap-2">
          <div className="size-1.5 rounded-full bg-slate-800" />
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Creative Preview Content */}
        <div
          className="flex-1 relative bg-cover bg-center"
          style={{ backgroundImage: `url('${listing.imageUrl}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

          <div className="absolute inset-0 flex flex-col justify-between p-8 z-20">
            {/* Top Section */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="bg-primary/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-white border border-white/20">
                  {listing.isPremium ? "NFT EXCLUSIVE" : "CREATIVE"}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur p-2 rounded-full">
                <span className="material-symbols-outlined text-white text-xl">favorite</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white leading-[1.1] tracking-tight uppercase">
                  {listing.title}
                </h3>
                {listing.description && (
                  <p className="text-base text-slate-200 leading-relaxed font-medium">
                    {listing.description}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full bg-white text-black font-black py-4 rounded-2xl text-sm tracking-widest hover:bg-slate-200 transition-colors shadow-xl"
                >
                  PURCHASE LICENSE
                </button>
                <div className="flex items-center justify-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Available on Marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safe Zone Indicator */}
          <div className="absolute inset-x-6 top-16 bottom-24 border border-blue-500/20 border-dashed rounded-xl pointer-events-none">
            <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-500/10 text-[9px] text-blue-400 font-bold uppercase border border-blue-500/20 rounded">
              Social Safe Zone
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
