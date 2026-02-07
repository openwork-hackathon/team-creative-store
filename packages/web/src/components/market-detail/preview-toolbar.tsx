import { Link } from "@tanstack/react-router"
import type { DeviceCategory } from "./types"
import { deviceOptions } from "./types"

interface PreviewToolbarProps {
  zoom: number
  selectedDevice: DeviceCategory
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export function PreviewToolbar({
  zoom,
  selectedDevice,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: PreviewToolbarProps) {
  const deviceOption = deviceOptions.find((d) => d.id === selectedDevice)
  const deviceLabel = deviceOption?.label ?? "Mobile"
  const sizeCount = deviceOption?.count ?? 4

  return (
    <div className="flex items-center justify-between gap-2 px-6 py-3 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <Link
          to="/market"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mr-2"
          title="Back to Marketplace"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <button
          type="button"
          className="p-2 text-primary bg-primary/10 rounded-lg transition-colors"
          title="Toggle Grid"
        >
          <span className="material-symbols-outlined">grid_4x4</span>
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoom <= 25}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined">zoom_out</span>
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoom >= 200}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <span className="material-symbols-outlined">zoom_in</span>
        </button>
        <div className="w-px h-6 bg-border mx-2" />
        <button
          type="button"
          onClick={onResetZoom}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-tighter"
          title="Reset Zoom"
        >
          View: {deviceLabel} Grid ({sizeCount} Sizes)
        </button>
      </div>
    </div>
  )
}
