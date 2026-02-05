import { createFileRoute, useParams, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { createApiClient } from "@/lib/api"

const api = createApiClient()

export const Route = createFileRoute("/_authenticated/market_/$id")({
  component: MarketDetailPage,
})

// Device options for preview
const deviceOptions = [
  { id: "mobile", label: "Mobile Portrait", icon: "smartphone" },
  { id: "desktop", label: "Desktop Billboard", icon: "desktop_windows" },
]

// Dimension options
const dimensionOptions = [
  { width: 1080, height: 1920, ratio: "9:16" },
  { width: 1080, height: 1080, ratio: "1:1" },
  { width: 1280, height: 720, ratio: "16:9" },
]

// Device presets for preview
const devicePresets = [
  { id: "iphone14", label: "iPhone 14 Pro Max" },
  { id: "galaxy", label: "Galaxy Ultra S23" },
  { id: "ipad", label: "iPad Pro (12.9\")" },
]

function MarketDetailPage() {
  const { id } = useParams({ from: "/_authenticated/market_/$id" })
  const [selectedDevice, setSelectedDevice] = useState("mobile")
  const [selectedDimension, setSelectedDimension] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState("iphone14")

  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplace", "listing", id],
    queryFn: () => api.getMarketplaceListing(id),
  })

  const listing = data?.listing

  if (isLoading) {
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

  if (error || !listing) {
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

  const currentDimension = dimensionOptions[selectedDimension]

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar - Purchase Info & Controls */}
      <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
        {/* Purchase Card */}
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
                  <span className="text-2xl font-black text-foreground">{Number(listing.priceAicc).toFixed(2)}</span>
                  <span className="text-xs font-bold text-muted-foreground">AICC</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">≈ ${(Number(listing.priceAicc) * 2.76).toFixed(2)}</p>
            </div>
            
            <div className="space-y-2">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
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

        {/* Device Selection */}
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Device Selection</h3>
              <p className="text-[11px] text-muted-foreground">Preview layouts</p>
            </div>
            <div className="flex flex-col gap-1">
              {deviceOptions.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setSelectedDevice(device.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    selectedDevice === device.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="material-symbols-outlined">{device.icon}</span>
                  <p className="text-sm font-medium">{device.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dimensions</h3>
            </div>
            <div className="flex flex-col gap-1">
              {dimensionOptions.map((dim, index) => (
                <button
                  key={`${dim.width}x${dim.height}`}
                  type="button"
                  onClick={() => setSelectedDimension(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedDimension === index
                      ? "bg-muted border border-border"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <p className={`text-xs font-mono ${selectedDimension === index ? "text-foreground uppercase" : ""}`}>
                    {dim.width} x {dim.height}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    selectedDimension === index ? "bg-primary/20 text-primary font-bold" : ""
                  }`}>
                    {dim.ratio}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Preview Area */}
      <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between gap-2 px-6 py-3 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <Link
              to="/market"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mr-2"
              title="Back to Marketplace"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <button className="p-2 text-primary bg-primary/10 rounded-lg transition-colors" title="Toggle Grid">
              <span className="material-symbols-outlined">grid_4x4</span>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Safety Zones">
              <span className="material-symbols-outlined">shield</span>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Zoom In">
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Fullscreen">
              <span className="material-symbols-outlined">fullscreen</span>
            </button>
            <div className="w-px h-6 bg-border mx-2" />
            <span className="text-sm font-medium text-muted-foreground">Zoom: 65%</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">JD</div>
              <div className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">AS</div>
              <div className="size-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">+4</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-bold hover:bg-muted/70 transition-colors">
              <span className="material-symbols-outlined text-sm">share</span>
              <span>Share Preview</span>
            </button>
          </div>
        </div>

        {/* Device Preset Tabs */}
        <div className="bg-card/30 border-b border-border">
          <div className="flex px-6 gap-8 overflow-x-auto">
            {devicePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                className={`flex flex-col items-center justify-center border-b-2 py-3 transition-all shrink-0 ${
                  selectedPreset === preset.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <p className={`text-sm ${selectedPreset === preset.id ? "font-bold tracking-tight" : "font-medium"}`}>
                  {preset.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Preview Area */}
        <div 
          className="flex-1 overflow-auto flex items-center justify-center p-12 relative"
          style={{
            backgroundImage: "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
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
                    <p className="text-base text-slate-200 leading-relaxed font-medium">
                      {listing.description}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full bg-white text-black font-black py-4 rounded-2xl text-sm tracking-widest hover:bg-slate-200 transition-colors shadow-xl">
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
      </main>
    </div>
  )
}
