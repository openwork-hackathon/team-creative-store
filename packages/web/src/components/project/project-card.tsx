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
    e.stopPropagation();
    onSelect?.(project.id, e.target.checked);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:border-primary hover:shadow-xl dark:bg-slate-900 ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Checkbox */}
      <div className="absolute left-3 top-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="size-5 rounded border-slate-300 bg-white/20 text-primary backdrop-blur-sm focus:ring-primary dark:border-slate-700"
        />
      </div>

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
          <button
            type="button"
            onClick={() => onMenuClick?.(project.id)}
            className="text-slate-400 hover:text-primary"
          >
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{project.updatedAt}</p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(project.id)}
              className="text-slate-400 transition-colors hover:text-primary"
              title="Edit"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onPreview?.(project.id)}
              className="text-slate-400 transition-colors hover:text-primary"
              title="Preview"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(project.id)}
              className="text-slate-400 transition-colors hover:text-red-500"
              title="Delete"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>

          {/* Publish Button - only show when ready */}
          {project.status === "ready" && (
            <button
              type="button"
              onClick={() => onPublish?.(project.id)}
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
