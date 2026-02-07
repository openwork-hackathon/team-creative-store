import type { Project } from "./types";
import { ProjectStatusBadge } from "./status-badge";

export interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (id: string) => void;
  onPreview?: (id: string) => void;
  onMenuClick?: (id: string) => void;
  onPublish?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProjectCard({
  project,
  isSelected = false,
  onSelect,
  onEdit,
  onPreview,
  onMenuClick,
  onPublish,
  onDelete
}: ProjectCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(project.id, e.target.checked);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary hover:shadow-xl ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-border"
      }`}
    >

      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${project.imageUrl}")` }}
        />
        <div className="absolute right-3 top-3">
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-bold text-foreground">{project.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{project.updatedAt}</p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(project.id)}
              className="text-muted-foreground transition-colors hover:text-primary"
              title="Edit"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onPreview?.(project.id)}
              className="text-muted-foreground transition-colors hover:text-primary"
              title="Preview"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(project.id)}
              className="text-muted-foreground transition-colors hover:text-destructive"
              title="Delete"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>

          {/* Publish Button - only show when not published */}
          {project.status !== "published" && (
            <button
              type="button"
              onClick={() => onPublish?.(project.id)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              title="Publish"
            >
              <span className="material-symbols-outlined text-base">publish</span>
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
