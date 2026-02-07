import { deviceOptions, getDimensionsByDevice, type DeviceCategory, type AdType } from "./types"

interface DimensionSelectorProps {
  selectedDevice: DeviceCategory
  onDeviceChange: (device: DeviceCategory) => void
}

// Get ad type icon
function getAdTypeIcon(adType: AdType): string {
  const icons: Record<AdType, string> = {
    banner: "view_day",
    rectangle: "crop_square",
    interstitial: "fullscreen",
    sidebar: "view_sidebar",
    leaderboard: "view_headline",
  }
  return icons[adType]
}

// Get unique ad types for a device
function getAdTypesForDevice(device: DeviceCategory): { type: AdType; count: number }[] {
  const dimensions = getDimensionsByDevice(device)
  const typeCounts = new Map<AdType, number>()
  
  for (const dim of dimensions) {
    if (dim.adType) {
      typeCounts.set(dim.adType, (typeCounts.get(dim.adType) || 0) + 1)
    }
  }
  
  return Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count }))
}

// Get ad type display name
function getAdTypeLabel(adType: AdType): string {
  const labels: Record<AdType, string> = {
    banner: "Banner",
    rectangle: "Rectangle",
    interstitial: "Interstitial",
    sidebar: "Sidebar",
    leaderboard: "Leaderboard",
  }
  return labels[adType]
}

export function DimensionSelector({
  selectedDevice,
  onDeviceChange,
}: DimensionSelectorProps) {
  const adTypes = getAdTypesForDevice(selectedDevice)

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Device Selection
        </h3>
        <p className="text-[11px] text-muted-foreground/70">Common ad sizes</p>
      </div>
      <div className="flex flex-col gap-1">
        {deviceOptions.map((device) => (
          <button
            key={device.id}
            type="button"
            onClick={() => onDeviceChange(device.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              selectedDevice === device.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-lg">{device.icon}</span>
            <p className="text-sm font-medium">{device.label}</p>
            <span className="ml-auto text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded">
              {device.count}
            </span>
          </button>
        ))}
      </div>

      {/* Ad Types for Selected Device */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Ad Types
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {adTypes.map(({ type, count }) => (
            <div
              key={type}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground"
            >
              <span className="material-symbols-outlined text-sm">{getAdTypeIcon(type)}</span>
              <span className="text-[10px] font-medium">{getAdTypeLabel(type)}</span>
              <span className="text-[9px] text-muted-foreground/70">({count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
