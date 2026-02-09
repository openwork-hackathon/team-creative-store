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
  onCategoryChange?: (category: DeviceCategory, firstSpecKey: PlacementSpecKey) => void;
  className?: string;
};

export function DeviceSizePicker({
  selectedSpecKey,
  onSpecSelect,
  selectedSpecs,
  onBatchSelect,
  onCategoryChange,
  className,
}: DeviceSizePickerProps) {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>("mobile");

  const specsByCategory = PLACEMENT_SPECS.filter((spec) => spec.category === activeCategory);

  const handleCategoryClick = (category: DeviceCategory) => {
    setActiveCategory(category);
    // Auto-select the first spec in this category for preview
    const firstSpec = PLACEMENT_SPECS.find((s) => s.category === category);
    if (firstSpec) {
      onSpecSelect(firstSpec.key);
    }
  };

  const handleToggle = (key: PlacementSpecKey) => {
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
    <div className={cn("flex flex-col h-full p-4", className)}>
      {/* Device Category Tabs */}
      <div className="flex flex-col gap-3 shrink-0">
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
              onClick={() => handleCategoryClick(tab.key)}
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
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        <div className="flex-none">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Dimensions
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 custom-scrollbar">
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
                <div
                  onClick={(e) => handleBatchToggle(spec.key, e)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all select-none",
                    selectedSpecs.includes(spec.key)
                      ? "bg-primary border-primary text-white"
                      : "border-slate-600 hover:border-primary"
                  )}
                >
                  {selectedSpecs.includes(spec.key) && (
                    <span className="material-symbols-outlined text-xs">check</span>
                  )}
                </div>
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
    </div>
  );
}
