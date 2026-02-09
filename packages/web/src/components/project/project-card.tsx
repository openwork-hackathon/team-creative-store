import type { Project } from "./types";
import { ProjectStatusBadge } from "./status-badge";

export interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onClick?: (id: string) => void;
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
  onClick,
  onSelect,
  onEdit,
  onPreview,
  onMenuClick,
  onPublish,
  onDelete
}: ProjectCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(project.id, e.target.checked);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:border-primary hover:shadow-xl dark:bg-slate-900 cursor-pointer ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-slate-200 dark:border-slate-800"
      }`}
      onClick={() => onClick?.(project.id)}
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
          <h3 className="truncate font-bold text-slate-900 dark:text-white">{project.title}</h3>         
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{project.updatedAt}</p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(project.id);
              }}
              className="text-slate-400 transition-colors hover:text-primary"
              title="Edit"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project.id);
              }}
              className="text-slate-400 transition-colors hover:text-red-500"
              title="Delete"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>

          {/* Publish Button - show when draft or ready */}
          {(project.status === "draft" || project.status === "ready") && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPublish?.(project.id);
              }}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
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
