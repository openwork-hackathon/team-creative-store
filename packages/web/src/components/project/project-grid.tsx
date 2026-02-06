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
  isLoading?: boolean;
}

export function ProjectGrid({
  projects,
  selectedIds,
  onSelect,
  onEdit,
  onPreview,
  onMenuClick,
  onPublish,
  isLoading = false
}: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-video bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-6 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
          <span className="material-symbols-outlined text-4xl text-muted-foreground">folder_off</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">No Projects Found</h3>
        <p className="mb-6 max-w-md text-muted-foreground">
          You don't have any projects yet. Create your first project to get started!
        </p>
      </div>
    );
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
        />
      ))}
    </div>
  );
}
