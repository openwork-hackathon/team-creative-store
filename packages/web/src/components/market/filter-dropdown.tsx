import { useState, useRef, useEffect } from "react";

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

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const hasValue = !!value;

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
          {hasValue ? selectedLabel : label}
        </p>
        <span className={`material-symbols-outlined transition-colors ${hasValue ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}>
          keyboard_arrow_down
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
              !value ? "font-semibold text-primary" : "text-slate-700 dark:text-slate-200"
            }`}
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
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
                value === option.value ? "font-semibold text-primary" : "text-slate-700 dark:text-slate-200"
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
