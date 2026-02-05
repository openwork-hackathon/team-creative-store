import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./app-layout";

describe("AppLayout", () => {
  it("renders the provided page content", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <AppLayout>
          <div>Page Content</div>
        </AppLayout>
      </QueryClientProvider>
    );
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });
});
