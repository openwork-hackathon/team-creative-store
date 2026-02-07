import { useState } from "react";
import { PLACEMENT_SPECS, type DeviceCategory, type PlacementSpecKey } from "../../../../shared/src/placementSpecs";
import { cn } from "@/lib/utils";

const DEVICE_TABS: { key: DeviceCategory; label: string; icon: string }[] = [
  { key: "mobile", label: "Mobile", icon: "smartphone" },
  { key: "web", label: "Web", icon: "desktop_windows" },
  { key: "tv", label: "TV", icon: "tv" },
];

type DeviceSizePickerProps = {
  selectedSpecKey: PlacementSpecKey;
  onSpecSelect: (key: PlacementSpecKey) => void;
  selectedSpecs: PlacementSpecKey[];
  onBatchSelect: (keys: PlacementSpecKey[]) => void;
  className?: string;
};

export function DeviceSizePicker({
  selectedSpecKey,
  onSpecSelect,
  selectedSpecs,
  onBatchSelect,
  className,
}: DeviceSizePickerProps) {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>("mobile");

  const specsByCategory = PLACEMENT_SPECS.filter((spec) => spec.category === activeCategory);

  const handleToggle = (key: PlacementSpecKey) => {
    if (key === selectedSpecKey) return;
    onSpecSelect(key);
  };

  const handleBatchToggle = (key: PlacementSpecKey, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = selectedSpecs.includes(key)
      ? selectedSpecs.filter((k) => k !== key)
      : [...selectedSpecs, key];
    onBatchSelect(newSelected);
  };

  return (
    <div className={cn("flex flex-col gap-6 h-full", className)}>
      {/* Device Category Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Device Selection
          </h3>
          <p className="text-xs text-slate-400">Preview layouts</p>
        </div>

        <div className="flex flex-col gap-1">
          {DEVICE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                activeCategory === tab.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <p className="text-sm font-medium">{tab.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Size List */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Dimensions
          </h3>
        </div>

        <div className="flex flex-col gap-1">
          {specsByCategory.map((spec) => (
            <button
              key={spec.key}
              onClick={() => handleToggle(spec.key)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg transition-all",
                selectedSpecKey === spec.key
                  ? "bg-slate-100 dark:bg-slate-800 border border-slate-700"
                  : "hover:bg-slate-800 transition-colors text-slate-400"
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleBatchToggle(spec.key, e)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    selectedSpecs.includes(spec.key)
                      ? "bg-primary border-primary text-white"
                      : "border-slate-600 hover:border-primary"
                  )}
                >
                  {selectedSpecs.includes(spec.key) && (
                    <span className="material-symbols-outlined text-xs">check</span>
                  )}
                </button>
                <p className="text-xs font-mono">{spec.width} × {spec.height}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-bold",
                  selectedSpecKey === spec.key
                    ? "bg-primary/20 text-primary"
                    : "bg-slate-700 text-slate-400"
                )}
              >
                {spec.aspectRatio}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Size Button */}
      <div className="mt-auto">
        <button className="w-full flex items-center justify-center gap-2 rounded-lg h-10 border-2 border-dashed border-slate-700 text-slate-400 text-sm font-medium hover:border-primary hover:text-primary transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Custom Size</span>
        </button>
      </div>
    </div>
  );
}
