import type { Project } from "./types";
import { ProjectCard } from "./project-card";

export interface ProjectGridProps {
  projects: Project[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onEdit?: (id: string) => void;
  onPreview?: (id: string) => void;
  onMenuClick?: (id: string) => void;
  onPublish?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-video bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="h-6 w-full rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <span className="material-symbols-outlined text-4xl text-slate-400">folder_off</span>
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">No Projects Found</h3>
      <p className="mb-6 max-w-md text-slate-500 dark:text-slate-400">
        You don't have any projects yet. Create your first project to get started!
      </p>
    </div>
  );
}

export function ProjectGrid({
  projects,
  selectedIds,
  onSelect,
  onEdit,
  onPreview,
  onMenuClick,
  onPublish,
  onDelete,
  isLoading = false
}: ProjectGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isSelected={selectedIds.has(project.id)}
          onSelect={onSelect}
          onEdit={onEdit}
          onPreview={onPreview}
          onMenuClick={onMenuClick}
          onPublish={onPublish}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
