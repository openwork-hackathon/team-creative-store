import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ProjectFilterBar,
  ProjectGrid,
  ProjectFab,
  PublishModal,
  type Project,
  type ProjectStatus,
  type PublishFormData
} from "@/components/project";
import { createApiClient, type PublishProjectInput } from "@/lib/api";

const api = createApiClient();

// Helper function to convert frontend category to API category
function convertCategory(category: string): PublishProjectInput["category"] {
  if (category === "e-commerce") return "e_commerce";
  return category as PublishProjectInput["category"];
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch projects from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.listProjects()
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
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const projects = data?.projects ?? [];

  // Filter state
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>();
  const [industryFilter, setIndustryFilter] = useState<string | undefined>();
  const [recencyFilter, setRecencyFilter] = useState<string | undefined>();

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

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }
      // Industry and recency filters would be applied here with real data
      return true;
    });
  }, [statusFilter, projects]);

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
    // Navigate to project editor
    navigate({ to: "/creative-studio", search: { projectId: id } });
  };

  const handlePreview = (id: string) => {
    // Open preview modal or navigate to preview page
    console.log("Preview project:", id);
  };

  const handleMenuClick = (id: string) => {
    // Open context menu
    console.log("Menu clicked for project:", id);
  };

  const handleNewProject = () => {
    // Navigate to create new project
    navigate({ to: "/creative-studio" });
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
    console.log("Delete projects:", Array.from(selectedIds));
    setSelectedIds(new Set());
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
          // TODO: Show error toast to user
        }
      }
    );
  }, [publishingProjectId, publishMutation]);

  const handleSaveDraft = useCallback((data: PublishFormData) => {
    console.log("Saving draft:", publishingProjectId, data);
    // TODO: Call API to save draft
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
          onEditSelection={handleEditSelection}
          onPreviewSelection={handlePreviewSelection}
          onArchiveSelection={handleArchiveSelection}
          onDeleteSelection={handleDeleteSelection}
        />
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">Failed to load projects. Please try again.</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-4">No projects yet</div>
          <button
            type="button"
            onClick={handleNewProject}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create your first project
          </button>
        </div>
      ) : (
        <ProjectGrid
          projects={filteredProjects}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onMenuClick={handleMenuClick}
          onPublish={handlePublishClick}
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
    </div>
  );
}
