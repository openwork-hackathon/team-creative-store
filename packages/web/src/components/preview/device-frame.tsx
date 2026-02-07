import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { PlacementSpec } from "../../../../shared/src/placementSpecs";

type DeviceFrameProps = {
  spec: PlacementSpec;
  zoom: number;
  showNotch?: boolean;
  children: React.ReactNode;
  className?: string;
};

export const DeviceFrame = forwardRef<HTMLDivElement, DeviceFrameProps>(
  ({ spec, zoom, showNotch = true, children, className }, ref) => {
    // Calculate scaled dimensions
    const scaledWidth = spec.width * zoom;
    const scaledHeight = spec.height * zoom;

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-black overflow-hidden flex flex-col transition-all duration-300",
          className
        )}
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          borderRadius: spec.category === "mobile" ? "24px" : "8px",
          borderWidth: "12px",
          borderColor: "#0f172a",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Notch / Dynamic Island for Mobile */}
        {spec.category === "mobile" && showNotch && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-20" />
        )}

        {/* Content Container */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

DeviceFrame.displayName = "DeviceFrame";
