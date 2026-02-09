import { FilterDropdown } from "@/components/market/filter-dropdown";
import type { ProjectStatus, RecencyFilter } from "./types";

export interface ProjectFilterBarProps {
  statusFilter?: ProjectStatus;
  industryFilter?: string;
  recencyFilter?: RecencyFilter;
  onStatusChange?: (value: ProjectStatus | undefined) => void;
  onIndustryChange?: (value: string | undefined) => void;
  onRecencyChange?: (value: RecencyFilter | undefined) => void;
  hasSelection?: boolean;
  selectionCount?: number;
  onEditSelection?: () => void;
  onPreviewSelection?: () => void;
  onArchiveSelection?: () => void;
  onDeleteSelection?: () => void;
}

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "generating", label: "Generating" },
  { value: "ready", label: "Ready" },
  { value: "published", label: "Published" }
];

const industryOptions = [
  { value: "tech", label: "Technology" },
  { value: "retail", label: "Retail" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "entertainment", label: "Entertainment" }
];

const recencyOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" }
];

export function ProjectFilterBar({
  statusFilter,
  industryFilter,
  recencyFilter,
  onStatusChange,
  onIndustryChange,
  onRecencyChange
}: ProjectFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterDropdown
          label="Status"
          options={statusOptions}
          value={statusFilter ?? ""}
          onChange={(v) => onStatusChange?.(v ? (v as ProjectStatus) : undefined)}
          placeholder="All"
        />

        <FilterDropdown
          label="Industry"
          options={industryOptions}
          value={industryFilter ?? ""}
          onChange={(v) => onIndustryChange?.(v || undefined)}
          placeholder="All"
        />

        <FilterDropdown
          label="Recency"
          options={recencyOptions}
          value={recencyFilter ?? ""}
          onChange={(v) => onRecencyChange?.(v ? (v as RecencyFilter) : undefined)}
          placeholder="All"
        />
      </div>
    </div>
  );
}
