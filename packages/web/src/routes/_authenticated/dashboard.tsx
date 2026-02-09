import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard-page";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "@tanstack/react-query";
import { createApiClient } from "@/lib/api";
import { useMemo } from "react";

const apiClient = createApiClient();

function DashboardRoute() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  // Fetch projects for the dashboard
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.listProjects()
  });

  // Calculate stats from projects data
  const stats = useMemo(() => {
    const projects = projectsData?.projects || [];
    
    // Count published creatives
    const publishedCount = projects.filter(p => p.status === "published").length;
    
    // Count daily generations (projects updated today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCount = projects.filter(p => {
      const updatedAt = new Date(p.updatedAt);
      return updatedAt >= today;
    }).length;
    
    return {
      dailyGenerations: { value: dailyCount, change: 0 },
      publishedCreatives: { value: publishedCount, change: 0 },
      monthlyRevenue: { value: "0 AICC", change: 0 }
    };
  }, [projectsData]);

  // Map projects to recent projects format
  const recentProjects =
    projectsData?.projects?.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.title,
      timestamp: p.updatedAt,
      status: p.status
    })) || [];

  const handleNewProject = () => {
    navigate({ to: "/creative-studio" });
  };

  const handleEnterGenerator = () => {
    navigate({ to: "/creative-studio" });
  };

  const handleProjectAction = (projectId: string, action: string) => {
    if (action === "continue") {
      navigate({ to: "/creative-studio", search: { projectId } });
    } else if (action === "preview") {
      navigate({ to: "/creative-studio", search: { projectId } });
    } else if (action === "publish") {
      navigate({ to: "/creative-studio", search: { projectId } });
    } else if (action === "view-logs") {
      navigate({ to: "/creative-studio", search: { projectId } });
    }
  };

  return (
    <DashboardPage
      userName={user?.name || user?.email || "Creator"}
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
