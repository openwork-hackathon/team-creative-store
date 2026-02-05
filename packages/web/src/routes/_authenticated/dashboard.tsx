import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard-page";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";
import { createApiClient } from "@/lib/api";

const apiClient = createApiClient();

function DashboardRoute() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  // Fetch projects for the dashboard
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.listProjects()
  });

  // Mock stats for now (TODO: fetch from API)
  const stats = {
    dailyGenerations: { value: 0, change: 0 },
    publishedCreatives: { value: 0, change: 0 },
    monthlyRevenue: { value: "0 AICC", change: 0 }
  };

  // Map projects to recent projects format
  const recentProjects =
    projectsData?.projects?.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      timestamp: "Recently",
      status: "draft" as const
    })) || [];

  const handleNewProject = () => {
    navigate({ to: "/generator" });
  };

  const handleEnterGenerator = () => {
    navigate({ to: "/generator" });
  };

  const handleProjectAction = (projectId: string, action: string) => {
    if (action === "continue") {
      navigate({ to: "/generator" });
    }
  };

  return (
    <DashboardPage
      userName={user?.user?.name || user?.user?.email || "Creator"}
      stats={stats}
      recentProjects={recentProjects}
      onNewProject={handleNewProject}
      onEnterGenerator={handleEnterGenerator}
      onProjectAction={handleProjectAction}
    />
  );
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRoute
});
