import { describe, expect, it, vi } from "vitest";
import { createWebAuthClient, getAuthBaseUrl } from "./auth-client";

describe("authClient", () => {
  it("creates the auth client with the base URL", () => {
    const factory = vi.fn().mockReturnValue({});
    createWebAuthClient(factory);
    expect(factory).toHaveBeenCalledWith({ baseURL: getAuthBaseUrl() });
  });
});
