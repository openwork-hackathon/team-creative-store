import { useState, useRef, useEffect } from "react";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Active chip with clear button
  if (isActive && value) {
    const selectedLabel = options.find((o) => o.value === value)?.label || label;
    return (
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
      >
        <span>{selectedLabel}</span>
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    );
  }

  // Dropdown chip
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-sm">expand_more</span>
      </button>

      {isOpen && options.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
                value === option.value
                  ? "font-semibold text-primary"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
