import { cn } from "@/lib/utils";
import type { PlacementSpec } from "../../../../shared/src/placementSpecs";

type DeviceTabsProps = {
  specs: PlacementSpec[];
  activeSpecKey: string;
  onSpecSelect: (key: string) => void;
  className?: string;
};

export function DeviceTabs({
  specs,
  activeSpecKey,
  onSpecSelect,
  className,
}: DeviceTabsProps) {
  return (
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
          className={cn(
            "flex flex-col items-center justify-center border-b-2 border-transparent py-3 transition-all shrink-0 min-w-[100px] text-slate-500 hover:text-slate-300"
          )}
        >
          <span className="material-symbols-outlined mb-1">add</span>
          <p className="text-sm font-medium">Custom</p>
        </button>
      </div>
    </div>
  );
}
