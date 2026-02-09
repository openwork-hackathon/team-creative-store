import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PlacementSpec } from "../../../../shared/src/placementSpecs";

type DeviceTabsProps = {
  specs: PlacementSpec[];
  activeSpecKey: string;
  onSpecSelect: (key: string) => void;
  onCustomClick?: () => void;
  className?: string;
};

export function DeviceTabs({
  specs,
  activeSpecKey,
  onSpecSelect,
  onCustomClick,
  className,
}: DeviceTabsProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);

  const handleCustomClick = () => {
    setShowCustomDialog(true);
  };

  const handleCustomConfirm = () => {
    if (customWidth > 0 && customHeight > 0) {
      onCustomClick?.(customWidth, customHeight);
      setShowCustomDialog(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-background-dark/30 border-b border-slate-800",
          className
        )}
      >
        <div className="flex px-6 gap-8 overflow-x-auto no-scrollbar">
          {specs.map((spec) => (
            <button
              key={spec.key}
              onClick={() => onSpecSelect(spec.key)}
              className={cn(
                "flex flex-col items-center justify-center border-b-2 py-3 transition-all shrink-0 min-w-[100px]",
                activeSpecKey === spec.key
                  ? "border-primary text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              <p className="text-sm font-bold tracking-tight">{spec.shortLabel}</p>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {spec.width}×{spec.height}
              </span>
            </button>
          ))}

          {/* Custom Device Option */}
          <button
            onClick={handleCustomClick}
            className={cn(
              "flex flex-col items-center justify-center border-b-2 py-3 transition-all shrink-0 min-w-[100px] text-slate-500 hover:text-slate-300 cursor-pointer"
            )}
          >
            <span className="material-symbols-outlined mb-1">add</span>
            <p className="text-sm font-medium">Custom</p>
          </button>
        </div>
      </div>

      {/* Custom Size Dialog */}
      {showCustomDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">Custom Size</h3>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Width (px)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customWidth || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCustomWidth(val ? Number(val) : 0);
                  }}
                  className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-900 text-white"
                  placeholder="1080"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Height (px)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customHeight || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCustomHeight(val ? Number(val) : 0);
                  }}
                  className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-900 text-white"
                  placeholder="1920"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="flex-1 px-3 py-2 rounded border border-slate-700 text-slate-400 hover:bg-slate-800"
                onClick={() => setShowCustomDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-3 py-2 rounded bg-primary text-white hover:opacity-90"
                onClick={handleCustomConfirm}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
