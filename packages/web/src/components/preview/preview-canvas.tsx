import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { PlacementSpec, PlacementSpecKey } from "../../../../shared/src/placementSpecs";
import { DeviceFrame } from "./device-frame";
import { SafeZoneOverlay } from "./safe-zone-overlay";
import { ZoomControls } from "./zoom-controls";

type PreviewCanvasProps = {
  spec: PlacementSpec;
  children: React.ReactNode;
  showGrid?: boolean;
  showSafeZone?: boolean;
  backgroundType?: "checkerboard" | "solid" | "transparent";
  className?: string;
};

export function PreviewCanvas({
  spec,
  children,
  showGrid = false,
  showSafeZone = true,
  backgroundType = "checkerboard",
  className,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Default to 0.25 (25%) when container is not ready
  const [zoom, setZoom] = useState<"fit" | number>(0.25);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate zoom to fit
  const calculateFitZoom = useCallback(() => {
    if (!containerRef.current) return 0.25;

    const container = containerRef.current;
    const padding = 48; // 12px padding on each side
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;

    const scaleX = availableWidth / spec.width;
    const scaleY = availableHeight / spec.height;

    return Math.min(scaleX, scaleY, 0.5); // Max zoom 50%
  }, [spec.height, spec.width]);

  // Update container size for zoom calculations
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const actualZoom = zoom === "fit" ? calculateFitZoom() : zoom;

  const handleZoomIn = () => {
    const currentZoom = zoom === "fit" ? calculateFitZoom() : zoom;
    const newZoom = Math.min(currentZoom + 0.25, 1);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const currentZoom = zoom === "fit" ? calculateFitZoom() : zoom;
    const newZoom = Math.max(currentZoom - 0.25, 0.25);
    setZoom(newZoom);
  };

  const handleZoomChange = (newZoom: "fit" | number) => {
    setZoom(newZoom);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center p-4 relative w-full",
        showGrid && "canvas-grid",
        backgroundType === "checkerboard" && "bg-white dark:bg-[#0b0f1a]",
        backgroundType === "solid" && "bg-slate-200 dark:bg-slate-800",
        className
      )}
    >
      {/* Device Frame with Preview */}
      <DeviceFrame spec={spec} zoom={actualZoom}>
        {children}

        {/* Safe Zone Overlay */}
        {showSafeZone && (
          <SafeZoneOverlay spec={spec} zoom={actualZoom} />
        )}
      </DeviceFrame>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-10">
        <ZoomControls
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </div>
    </div>
  );
}
