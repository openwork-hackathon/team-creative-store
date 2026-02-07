import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/_authenticated/creative-studio";
import { CampaignGenerator } from "@/components/campaign/campaign-generator";
import { ProjectSelectorModal } from "@/components/creative-studio";

export function CreativeStudioPage() {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = Route.useSearch();

  const [isModalOpen, setIsModalOpen] = useState(!urlProjectId);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    urlProjectId ?? null
  );

  // Sync URL changes to local state
  useEffect(() => {
    if (urlProjectId) {
      setSelectedProjectId(urlProjectId);
      setIsModalOpen(false);
    }
  }, [urlProjectId]);

  const handleSelectProject = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      setIsModalOpen(false);
      // Update URL with selected project
      navigate({
        to: "/creative-studio",
        search: { projectId },
        replace: true,
      });
    },
    [navigate]
  );

  const handleCreateProject = useCallback(() => {
    // Navigate to projects page to create a new project
    navigate({ to: "/projects" });
  }, [navigate]);

  const handleClose = useCallback(() => {
    // Navigate to dashboard when closing modal without selection
    navigate({ to: "/dashboard" });
  }, [navigate]);

  // Show modal if no project selected
  if (!selectedProjectId) {
    return (
      <ProjectSelectorModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
      />
    );
  }

  return <CampaignGenerator projectId={selectedProjectId} />;
}
