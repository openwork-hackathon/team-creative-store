import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ProjectFilterBar,
  ProjectGrid,
  ProjectFab,
  PublishModal,
  type ProjectStatus,
  type RecencyFilter,
  type PublishFormData
} from "@/components/project";
import { createApiClient, type PublishProjectInput } from "@/lib/api";

const api = createApiClient();

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper function to convert frontend category to API category
function convertCategory(category: string): PublishProjectInput["category"] {
  if (category === "e-commerce") return "e_commerce";
  return category as PublishProjectInput["category"];
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>();
  const [industryFilter, setIndustryFilter] = useState<string | undefined>();
  const [recencyFilter, setRecencyFilter] = useState<RecencyFilter | undefined>();

  // Fetch projects from API with search, status, and recency filters
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", debouncedSearch, statusFilter, recencyFilter],
    queryFn: () => api.getProjects(debouncedSearch || undefined, statusFilter, recencyFilter)
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: PublishFormData }) =>
      api.publishProject(projectId, {
        title: data.title,
        description: data.description,
        category: convertCategory(data.category),
        licenseType: data.licenseType,
        tags: data.tags,
        price: data.price,
        includeSourceFiles: data.includeSourceFiles
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => api.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const projects = data?.projects ?? [];

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Publish modal state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishingProjectId, setPublishingProjectId] = useState<string | null>(null);

  // Get the project being published
  const publishingProject = useMemo(() => {
    if (!publishingProjectId) return null;
    return projects.find((p) => p.id === publishingProjectId) ?? null;
  }, [publishingProjectId, projects]);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleEdit = (id: string) => {
    navigate({ to: "/creative-studio", search: { projectId: id } });
  };

  const handlePreview = (id: string) => {
    console.log("Preview project:", id);
  };

  const handleMenuClick = (id: string) => {
    console.log("Menu clicked for project:", id);
  };

  const handleNewProject = () => {
    navigate({ to: "/projects/new" });
  };

  const handleCardClick = (id: string) => {
    navigate({ to: "/creative-studio", search: { projectId: id } });
  };

  const handleEditSelection = () => {
    if (selectedIds.size === 1) {
      const [id] = selectedIds;
      handleEdit(id);
    }
  };

  const handlePreviewSelection = () => {
    if (selectedIds.size === 1) {
      const [id] = selectedIds;
      handlePreview(id);
    }
  };

  const handleArchiveSelection = () => {
    console.log("Archive projects:", Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleDeleteSelection = () => {
    if (selectedIds.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} project(s)? This action cannot be undone.`)) {
      Promise.all(Array.from(selectedIds).map(id => deleteMutation.mutateAsync(id)))
        .then(() => {
          setSelectedIds(new Set());
        })
        .catch((error) => {
          console.error("Failed to delete projects:", error);
        });
    }
  };

  const handleDeleteProject = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;

    deleteMutation.mutate(deleteConfirmId, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
      onError: (error) => {
        console.error("Failed to delete project:", error);
        setDeleteConfirmId(null);
      }
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Publish handlers
  const handlePublishClick = useCallback((id: string) => {
    setPublishingProjectId(id);
    setPublishModalOpen(true);
  }, []);

  const handlePublishClose = useCallback(() => {
    setPublishModalOpen(false);
    setPublishingProjectId(null);
  }, []);

  const handlePublishSubmit = useCallback((data: PublishFormData) => {
    if (!publishingProjectId) return;
    
    publishMutation.mutate(
      { projectId: publishingProjectId, data },
      {
        onSuccess: () => {
          setPublishModalOpen(false);
          setPublishingProjectId(null);
        },
        onError: (error) => {
          console.error("Failed to publish project:", error);
        }
      }
    );
  }, [publishingProjectId, publishMutation]);

  const handleSaveDraft = useCallback((data: PublishFormData) => {
    console.log("Saving draft:", publishingProjectId, data);
    setPublishModalOpen(false);
    setPublishingProjectId(null);
  }, [publishingProjectId]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-10">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-[-0.033em] text-foreground md:text-4xl">
          Projects
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your AI creative projects, campaigns, and assets
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <ProjectFilterBar
          statusFilter={statusFilter}
          industryFilter={industryFilter}
          recencyFilter={recencyFilter}
          onStatusChange={setStatusFilter}
          onIndustryChange={setIndustryFilter}
          onRecencyChange={setRecencyFilter}
          hasSelection={selectedIds.size > 0}
          selectionCount={selectedIds.size}
          onEditSelection={handleEditSelection}
          onPreviewSelection={handlePreviewSelection}
          onArchiveSelection={handleArchiveSelection}
          onDeleteSelection={handleDeleteSelection}
        />
      </div>

      {/* Project Grid */}
      {error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load projects. Please try again.</div>
        </div>
      ) : (
        <ProjectGrid
          projects={projects}
          selectedIds={selectedIds}
          onClick={handleCardClick}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onMenuClick={handleMenuClick}
          onPublish={handlePublishClick}
          onDelete={handleDeleteProject}
          isLoading={isLoading}
        />
      )}

      {/* Floating Action Button */}
      <ProjectFab onClick={handleNewProject} />

      {/* Publish Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        projectTitle={publishingProject?.title}
        onClose={handlePublishClose}
        onPublish={handlePublishSubmit}
        onSaveDraft={handleSaveDraft}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Delete Project?</h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
