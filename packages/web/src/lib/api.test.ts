import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "./api";

describe("createApiClient", () => {
  it("posts new projects to the API", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const api = createApiClient(fetcher, "/api");

    await api.createProject("My First Project");

    expect(fetcher).toHaveBeenCalledWith("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: "My First Project" })
    });
  });

  it("posts briefs to the project endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const api = createApiClient(fetcher, "/api");

    await api.createBrief("project-id", {
      intentText: "Launch a sale",
      placements: ["square_1_1"]
    });

    expect(fetcher).toHaveBeenCalledWith("/api/projects/project-id/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ intentText: "Launch a sale", placements: ["square_1_1"] })
    });
  });

  it("fetches the current user", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const api = createApiClient(fetcher, "/api");

    await api.getCurrentUser();

    expect(fetcher).toHaveBeenCalledWith("/api/user/@me", {
      credentials: "include"
    });
  });

  it("uploads logo files", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const api = createApiClient(fetcher, "/api");
    const formData = new FormData();
    formData.append("files", new File(["logo"], "logo.png", { type: "image/png" }));

    await api.uploadLogo(formData);

    expect(fetcher).toHaveBeenCalledWith("/api/uploads/logo", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
  });

  it("uploads visual files", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const api = createApiClient(fetcher, "/api");
    const formData = new FormData();
    formData.append("files", new File(["visual"], "visual.jpg", { type: "image/jpeg" }));

    await api.uploadVisuals(formData);

    expect(fetcher).toHaveBeenCalledWith("/api/uploads/visuals", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
  });
});
