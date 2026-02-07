import type { MarketListing, DimensionOption, DeviceCategory, AdType } from "./types"
import { getDimensionsByDevice } from "./types"

interface CreativePreviewProps {
  listing: MarketListing
  zoom?: number
  selectedDevice: DeviceCategory
}

interface SinglePreviewProps {
  listing: MarketListing
  dimension: DimensionOption
}

// Get ad type display name
function getAdTypeLabel(adType?: AdType): string {
  const labels: Record<AdType, string> = {
    banner: "Banner",
    rectangle: "Rectangle",
    interstitial: "Interstitial",
    sidebar: "Sidebar",
    leaderboard: "Leaderboard",
  }
  return adType ? labels[adType] : "Standard"
}

function SinglePreview({ listing, dimension }: SinglePreviewProps) {
  // Calculate aspect ratio for CSS
  const aspectRatio = dimension.width / dimension.height

  // Determine max width based on actual pixel width to maintain visual consistency
  // Use the actual ad width as the max width to preserve intended proportions
  let maxWidth: string
  if (aspectRatio < 0.7) {
    // Tall formats like 9:16, sidebars - cap at reasonable width
    maxWidth = `${Math.min(dimension.width, 280)}px`
  } else if (aspectRatio > 4) {
    // Very wide banners (320x50, 728x90, etc.) - use actual width
    maxWidth = `${dimension.width}px`
  } else if (aspectRatio > 2) {
    // Wide banners - use actual width capped at 600px
    maxWidth = `${Math.min(dimension.width, 600)}px`
  } else {
    // Standard formats - use actual width capped at 400px
    maxWidth = `${Math.min(dimension.width, 400)}px`
  }

  // Determine padding based on ad size
  const isSmallAd = dimension.height <= 100
  const padding = isSmallAd ? "p-2" : aspectRatio < 1 ? "p-4" : "p-6"

  // Determine text sizes based on ad dimensions
  const titleSize = isSmallAd ? "text-xs" : aspectRatio < 1 ? "text-lg" : "text-xl"
  const showDescription = !isSmallAd && aspectRatio < 1.5 && dimension.height >= 250

  return (
    <div className="break-inside-avoid mb-6">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {dimension.label}
          </span>
          {dimension.adType && (
            <span className="text-[9px] font-medium text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
              {getAdTypeLabel(dimension.adType)}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
          {dimension.width} × {dimension.height}
        </span>
      </div>

      {/* Preview Card */}
      <div
        className="relative bg-black border border-border shadow-lg rounded-lg overflow-hidden group mx-auto"
        style={{
          aspectRatio: `${dimension.width}/${dimension.height}`,
          maxWidth,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${listing.imageUrl}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className={`absolute inset-0 flex flex-col justify-between ${padding}`}>
            {/* Top Badge - hide for very small ads */}
            {!isSmallAd && (
              <span className="self-start bg-primary/90 px-1.5 py-0.5 rounded text-[7px] font-black text-white tracking-widest">
                {listing.isPremium ? "NFT" : "AD"}
              </span>
            )}

            {/* Bottom Content */}
            <div className={isSmallAd ? "space-y-0" : "space-y-2"}>
              <h3 className={`${titleSize} font-black text-white leading-tight uppercase ${isSmallAd ? "line-clamp-1" : ""}`}>
                {listing.title}
              </h3>
              {showDescription && listing.description && (
                <p className="text-[10px] text-slate-300 font-medium line-clamp-2">
                  {listing.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Group dimensions by ad type for better organization
function groupByAdType(dimensions: DimensionOption[]): Map<AdType | "other", DimensionOption[]> {
  const groups = new Map<AdType | "other", DimensionOption[]>()
  
  for (const dim of dimensions) {
    const key = dim.adType || "other"
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(dim)
  }
  
  return groups
}

export function CreativePreview({
  listing,
  zoom = 100,
  selectedDevice,
}: CreativePreviewProps) {
  const scale = zoom / 100
  const dimensions = getDimensionsByDevice(selectedDevice)
  const groupedDimensions = groupByAdType(dimensions)

  // Determine column count based on number of dimensions
  const columnCount = dimensions.length > 6 ? 3 : dimensions.length > 3 ? 2 : 1

  return (
    <div
      className="flex-1 overflow-y-auto p-8 relative"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Grid Container */}
      <div
        className="max-w-7xl mx-auto transition-transform duration-200 ease-out origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Render by ad type groups */}
        {Array.from(groupedDimensions.entries()).map(([adType, dims]) => (
          <div key={adType} className="mb-8">
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                {getAdTypeLabel(adType === "other" ? undefined : adType)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {dims.length} size{dims.length > 1 ? "s" : ""}
              </span>
            </div>
            
            {/* Masonry Grid */}
            <div
              className="gap-6"
              style={{
                columnCount: Math.min(columnCount, dims.length),
                columnGap: "1.5rem",
              }}
            >
              {dims.map((dimension) => (
                <SinglePreview
                  key={`${dimension.width}x${dimension.height}-${dimension.label}`}
                  listing={listing}
                  dimension={dimension}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
