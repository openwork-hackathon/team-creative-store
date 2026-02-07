import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ZoomLevel = "fit" | number;

type ZoomControlsProps = {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  className?: string;
};

const ZOOM_OPTIONS = [
  { label: "Fit", value: "fit" },
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2 },
];

export function ZoomControls({
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  className,
}: ZoomControlsProps) {
  const zoomPercentage = zoom === "fit" ? "Fit" : `${Math.round((zoom as number) * 100)}%`;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        className="text-slate-400 hover:text-white"
      >
        <span className="material-symbols-outlined">remove</span>
      </Button>

      {/* Zoom Percentage Dropdown */}
      <div className="relative group">
        <button
          className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          {zoomPercentage}
        </button>

        {/* Dropdown Menu */}
        <div className="absolute top-full right-0 mt-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[100px]">
          {ZOOM_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => onZoomChange(option.value)}
              className={cn(
                "w-full px-4 py-2 text-left text-sm transition-colors",
                zoom === option.value
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom In */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        className="text-slate-400 hover:text-white"
      >
        <span className="material-symbols-outlined">add</span>
      </Button>
    </div>
  );
}
