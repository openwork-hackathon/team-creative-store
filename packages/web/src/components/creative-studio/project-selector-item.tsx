import type { Project } from "@/components/project/types";
import { ProjectStatusBadge } from "@/components/project/status-badge";

export interface ProjectSelectorItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProjectSelectorItem({
  project,
  isSelected,
  onSelect,
}: ProjectSelectorItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary hover:shadow-lg ${
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "border-border"
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
          <span className="material-symbols-outlined text-base">check</span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.imageUrl ? (
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url("${project.imageUrl}")` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">
              image
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-4">
        <h3 className="truncate font-bold text-foreground">{project.title}</h3>
        <p className="text-xs text-muted-foreground">
          Updated {project.updatedAt}
        </p>
      </div>
    </button>
  );
}
