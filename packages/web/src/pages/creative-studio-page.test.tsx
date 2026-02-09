import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignGenerator } from "@/components/campaign/campaign-generator";

describe("CreativeStudioPage", () => {
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
