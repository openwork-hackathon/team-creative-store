import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@/components/project/types";
import { ProjectSelectorItem } from "./project-selector-item";
import { createApiClient } from "@/lib/api";

export interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectSelectorModal({
  isOpen,
  onClose,
  onSelectProject,
  onCreateProject,
}: ProjectSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const api = useMemo(() => createApiClient(), []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["projects", "selector"],
    queryFn: () => api.listProjects(),
    enabled: isOpen,
  });

  const projects: Project[] = useMemo(() => {
    const raw = data?.projects ?? [];
    return raw.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      imageUrl: p.imageUrl,
      updatedAt: p.updatedAt,
    }));
  }, [data?.projects]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter((p) =>
      p.title.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleSelect = useCallback((projectId: string) => {
    setSelectedId(projectId);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedId) {
      onSelectProject(selectedId);
    }
  }, [selectedId, onSelectProject]);

  if (!isOpen) return null;

  const hasProjects = projects.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Select a Project
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a project to generate creatives for
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Search */}
          {hasProjects && (
            <div className="relative mb-6">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-destructive">
                error
              </span>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Failed to load projects
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && !hasProjects && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-muted-foreground">
                folder_off
              </span>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                No Projects Yet
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Create your first project to start generating creative content.
              </p>
              <button
                type="button"
                onClick={onCreateProject}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Create Your First Project
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && hasProjects && (
            <>
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined mb-4 text-5xl text-muted-foreground">
                    search_off
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-foreground">
                    No Results
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No projects match "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectSelectorItem
                      key={project.id}
                      project={project}
                      isSelected={selectedId === project.id}
                      onSelect={() => handleSelect(project.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onCreateProject}
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create New Project
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId}
              className="px-6 py-2.5 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
