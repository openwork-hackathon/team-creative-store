import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignGenerator } from "@/components/campaign/campaign-generator";
import { ProjectSelectorModal } from "@/components/creative-studio";

describe("CreativeStudioPage", () => {
  it("renders the project selector modal when no projectId is provided", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectSelectorModal
          isOpen={true}
          onClose={() => {}}
          onSelectProject={() => {}}
          onCreateProject={() => {}}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText("Select a Project")).toBeInTheDocument();
  });

  it("renders the campaign generator when projectId is provided", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CampaignGenerator projectId="test-project-id" />
      </QueryClientProvider>
    );

    expect(screen.getByText("AI Campaign Generator")).toBeInTheDocument();
  });
});
