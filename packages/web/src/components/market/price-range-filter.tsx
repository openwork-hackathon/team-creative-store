import { useState } from "react";

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

  const displayLabel = priceMin || priceMax
    ? `${priceMin || "0"} - ${priceMax || "∞"} AICC`
    : "All";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-border bg-card pl-4 pr-3 transition-colors hover:border-primary"
      >
        <p className="text-sm font-medium text-foreground">Price: {displayLabel}</p>
        <span className="material-symbols-outlined text-muted-foreground">keyboard_arrow_down</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[200px] rounded-lg border border-border bg-card p-4 shadow-xl">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Min Price (AICC)</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => onPriceMinChange(e.target.value)}
                  placeholder="0"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Price (AICC)</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => onPriceMaxChange(e.target.value)}
                  placeholder="No limit"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onPriceMinChange("");
                  onPriceMaxChange("");
                }}
                className="w-full rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
