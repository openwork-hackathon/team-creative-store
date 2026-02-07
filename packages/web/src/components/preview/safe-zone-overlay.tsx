import { cn } from "@/lib/utils";
import type { PlacementSpec } from "../../../../shared/src/placementSpecs";

type SafeZoneOverlayProps = {
  spec: PlacementSpec;
  zoom: number;
  showLabels?: boolean;
  className?: string;
};

export function SafeZoneOverlay({
  spec,
  zoom,
  showLabels = true,
  className,
}: SafeZoneOverlayProps) {
  const { safeArea } = spec;

  // Calculate scaled margins
  const top = safeArea.top * zoom;
  const right = safeArea.right * zoom;
  const bottom = safeArea.bottom * zoom;
  const left = safeArea.left * zoom;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-30",
        className
      )}
    >
      {/* Top Safe Zone */}
      <div
        className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/30"
        style={{ height: `${top}px` }}
      >
        {showLabels && (
          <span className="absolute top-1 left-2 text-[8px] text-red-400 font-bold uppercase">
            Safe Zone
          </span>
        )}
      </div>

      {/* Bottom Safe Zone */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-red-500/10 border-t border-red-500/30"
        style={{ height: `${bottom}px` }}
      />

      {/* Left Safe Zone */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-red-500/10 border-r border-red-500/30"
        style={{ width: `${left}px` }}
      />

      {/* Right Safe Zone */}
      <div
        className="absolute top-0 bottom-0 right-0 bg-red-500/10 border-l border-red-500/30"
        style={{ width: `${right}px` }}
      />

      {/* Corner Indicators */}
      {showLabels && (
        <>
          <span
            className="absolute text-[8px] text-red-400 font-bold"
            style={{ top: `${top + 4}px`, left: `${left + 4}px` }}
          >
            {safeArea.top}px
          </span>
          <span
            className="absolute text-[8px] text-red-400 font-bold"
            style={{ bottom: `${bottom + 4}px`, left: `${left + 4}px` }}
          >
            {safeArea.bottom}px
          </span>
        </>
      )}
    </div>
  );
}
