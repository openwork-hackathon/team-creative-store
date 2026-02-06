import { useState } from "react";

export interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "All"
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-border bg-card pl-4 pr-3 transition-colors hover:border-primary"
      >
        <p className="text-sm font-medium text-foreground">{label}: {selectedLabel}</p>
        <span className="material-symbols-outlined text-muted-foreground">keyboard_arrow_down</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-xl">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${!value ? "text-primary font-semibold" : "text-foreground"}`}
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${value === option.value ? "text-primary font-semibold" : "text-foreground"}`}
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
