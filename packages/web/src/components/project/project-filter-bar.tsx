import { FilterChip } from "./filter-chip";
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
  onRecencyChange,
  hasSelection = false,
  selectionCount = 0,
  onEditSelection,
  onPreviewSelection,
  onArchiveSelection,
  onDeleteSelection
}: ProjectFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => onStatusChange?.(v as ProjectStatus)}
        />

        {statusFilter && (
          <FilterChip
            label={statusOptions.find((o) => o.value === statusFilter)?.label || statusFilter}
            value={statusFilter}
            options={statusOptions}
            isActive
            onClear={() => onStatusChange?.(undefined)}
          />
        )}

        <FilterChip
          label="Industry"
          options={industryOptions}
          value={industryFilter}
          onChange={onIndustryChange}
        />

        {industryFilter && (
          <FilterChip
            label={industryOptions.find((o) => o.value === industryFilter)?.label || industryFilter}
            value={industryFilter}
            options={industryOptions}
            isActive
            onClear={() => onIndustryChange?.(undefined)}
          />
        )}

        <FilterChip
          label="Recency"
          options={recencyOptions}
          value={recencyFilter}
          onChange={(v) => onRecencyChange?.(v as RecencyFilter)}
        />

        {recencyFilter && (
          <FilterChip
            label={recencyOptions.find((o) => o.value === recencyFilter)?.label || recencyFilter}
            value={recencyFilter}
            options={recencyOptions}
            isActive
            onClear={() => onRecencyChange?.(undefined)}
          />
        )}
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center gap-1 border-l border-slate-200 pl-4 dark:border-slate-800">
        <span className="mr-2 text-xs font-medium text-slate-500">
          {hasSelection ? `${selectionCount} selected` : "Selection:"}
        </span>
        <button
          type="button"
          onClick={onEditSelection}
          disabled={!hasSelection}
          className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:hover:bg-slate-800"
          title="Edit Selection"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
        <button
          type="button"
          onClick={onPreviewSelection}
          disabled={!hasSelection}
          className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:hover:bg-slate-800"
          title="Preview Selection"
        >
          <span className="material-symbols-outlined">visibility</span>
        </button>
        <button
          type="button"
          onClick={onArchiveSelection}
          disabled={!hasSelection}
          className="rounded p-2 text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          title="Archive Selection"
        >
          <span className="material-symbols-outlined">archive</span>
        </button>
        <button
          type="button"
          onClick={onDeleteSelection}
          disabled={!hasSelection}
          className="rounded p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          title="Delete Selection"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
