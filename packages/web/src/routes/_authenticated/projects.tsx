import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/pages/projects-page";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage
});
