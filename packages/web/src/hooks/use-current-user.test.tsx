import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCurrentUser } from "./use-current-user";

describe("useCurrentUser", () => {
  it("returns the current user from the API", async () => {
    const api = {
      getCurrentUser: async () => ({ user: { id: "user_1", email: "a@b.com" } })
    };
    const client = new QueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCurrentUser(api), { wrapper });

    await waitFor(() => expect(result.current.data?.email).toBe("a@b.com"));
  });
});
