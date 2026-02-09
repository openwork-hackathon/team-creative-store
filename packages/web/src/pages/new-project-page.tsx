import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApiClient } from "@/lib/api";

const api = createApiClient();

export function NewProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState("");

  const createMutation = useMutation({
    mutationFn: (name: string) => api.createProject(name),
    onSuccess: () => {
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Navigate to projects list after creation
      navigate({ to: "/projects" });
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      createMutation.mutate(projectName.trim());
    }
  };

  const handleCancel = () => {
    navigate({ to: "/projects" });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
          <p className="mt-2 text-muted-foreground">
            Give your project a name to get started. You can always change it later.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project-name" className="mb-2 block text-sm font-medium text-foreground">
              Project Name
            </label>
            <Input
              id="project-name"
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              autoFocus
              disabled={createMutation.isPending}
              className="text-base"
            />
          </div>

          {/* Error Message */}
          {createMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              Failed to create project. Please try again.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!projectName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
