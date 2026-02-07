import { createFileRoute } from "@tanstack/react-router";
import { NewProjectPage } from "@/pages/new-project-page";

export const Route = createFileRoute("/_authenticated/projects_/new")({
  component: NewProjectPage
});
