import { useState, useRef, useEffect } from "react";

export interface PriceRangeFilterProps {
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
}

export function PriceRangeFilter({
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange
}: PriceRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Local state for input values (only applied on "Apply" click)
  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);

  // Sync local state when parent values change (e.g., from external clear)
  useEffect(() => {
    setLocalMin(priceMin);
    setLocalMax(priceMax);
  }, [priceMin, priceMax]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasValue = priceMin || priceMax;

  const handleApply = () => {
    onPriceMinChange(localMin);
    onPriceMaxChange(localMax);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    onPriceMinChange("");
    onPriceMaxChange("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 transition-colors hover:border-primary ${
          hasValue
            ? "border-primary/30 bg-primary/10"
            : "border-slate-200 bg-white dark:border-[#2d3a54] dark:bg-[#1b2537]"
        }`}
      >
        <p className={`text-sm font-medium ${hasValue ? "text-primary" : "text-slate-700 dark:text-slate-200"}`}>
          Price Range
        </p>
        <span className={`material-symbols-outlined transition-colors ${hasValue ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}>
          keyboard_arrow_down
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Min Price (AICC)
              </label>
              <input
                type="number"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                placeholder="0"
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Max Price (AICC)
              </label>
              <input
                type="number"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                placeholder="No limit"
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
