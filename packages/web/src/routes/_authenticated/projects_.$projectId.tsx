import { createFileRoute } from "@tanstack/react-router";
import { ProjectDetailPage } from "@/pages/project-detail-page";

export const Route = createFileRoute("/_authenticated/projects_/$projectId")({
  component: ProjectDetailPage
});
