import { FilterChip } from "./filter-chip";
import type { ProjectStatus } from "./types";

export interface ProjectFilterBarProps {
  statusFilter?: ProjectStatus;
  industryFilter?: string;
  recencyFilter?: string;
  onStatusChange?: (value: ProjectStatus | undefined) => void;
  onIndustryChange?: (value: string | undefined) => void;
  onRecencyChange?: (value: string | undefined) => void;
  hasSelection?: boolean;
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
  onEditSelection,
  onPreviewSelection,
  onArchiveSelection,
  onDeleteSelection
}: ProjectFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
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
            isActive
            onClear={() => onIndustryChange?.(undefined)}
          />
        )}

        <FilterChip
          label="Recency"
          options={recencyOptions}
          value={recencyFilter}
          onChange={onRecencyChange}
        />

        {recencyFilter && (
          <FilterChip
            label={recencyOptions.find((o) => o.value === recencyFilter)?.label || recencyFilter}
            value={recencyFilter}
            isActive
            onClear={() => onRecencyChange?.(undefined)}
          />
        )}
      </div>
    </div>
  );
}
