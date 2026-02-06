import { useState } from "react";

export interface FilterChipProps {
  label: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  isActive?: boolean;
}

export function FilterChip({
  label,
  options = [],
  value,
  onChange,
  onClear,
  isActive = false
}: FilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Active chip with clear button
  if (isActive && value) {
    return (
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
      >
        <span>{selectedLabel || value}</span>
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    );
  }

  // Dropdown chip
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-sm">expand_more</span>
      </button>

      {isOpen && options.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-card py-1 shadow-xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${
                  value === option.value ? "font-semibold text-primary" : "text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
