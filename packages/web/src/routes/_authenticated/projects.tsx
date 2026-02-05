import { createFileRoute } from "@tanstack/react-router";

function ProjectsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Projects</h1>
      <p className="text-muted-foreground">Project list (coming next).</p>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage
});
