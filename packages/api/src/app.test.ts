import { describe, expect, it } from "vitest";
import { createApp } from "./app";

type Project = { id: string; name: string; userId: string };
type Brief = { id: string; projectId: string; intentText: string; briefJson: unknown; constraints: unknown };
type Draft = { id: string; briefId: string; draftJson: unknown };

const createMemoryPrisma = () => {
  const projects: Project[] = [];
  const briefs: Brief[] = [];
  const drafts: Draft[] = [];
  return {
    project: {
      findMany: async ({ where }: { where: { userId: string } }) =>
        projects.filter((project) => project.userId === where.userId),
      create: async ({ data }: { data: Project }) => {
        const project = { ...data, id: data.id ?? `proj_${projects.length + 1}` } as Project;
        projects.push(project);
        return project;
      }
    },
    brief: {
      create: async ({ data }: { data: Brief }) => {
        const brief = { ...data, id: data.id ?? `brief_${briefs.length + 1}` } as Brief;
        briefs.push(brief);
        return brief;
      },
      findUnique: async ({ where }: { where: { id: string } }) =>
        briefs.find((brief) => brief.id === where.id) ?? null
    },
    draft: {
      create: async ({ data }: { data: Draft }) => {
        const draft = { ...data, id: data.id ?? `draft_${drafts.length + 1}` } as Draft;
        drafts.push(draft);
        return draft;
      },
      findMany: async () => []
    },
    placementSpec: {
      upsert: async () => ({})
    }
  };
};

describe("createApp", () => {
  it("creates and lists projects for the authenticated user", async () => {
    const prisma = createMemoryPrisma();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } })
    });

    const createResponse = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Demo Project" })
    });

    const createPayload = await createResponse.json();
    expect(createPayload.project.name).toBe("Demo Project");

    const listResponse = await app.request("/api/projects");
    const listPayload = await listResponse.json();
    expect(listPayload.projects).toHaveLength(1);
  });

  it("returns the authenticated user profile", async () => {
    const prisma = createMemoryPrisma();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1", email: "test@example.com" } })
    });

    const response = await app.request("/api/user/@me");
    const payload = await response.json();

    expect(payload.user.email).toBe("test@example.com");
  });

  it("accepts asset uploads and returns metadata", async () => {
    const prisma = createMemoryPrisma();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } })
    });

    const formData = new FormData();
    formData.append(
      "files",
      new File(["logo"], "logo.png", { type: "image/png" })
    );

    const response = await app.request("/api/uploads/logo", {
      method: "POST",
      body: formData
    });
    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(payload.files[0].name).toBe("logo.png");
  });

  it("creates and returns briefs for a project", async () => {
    const prisma = createMemoryPrisma();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } })
    });

    const projectResponse = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Demo Project" })
    });
    const projectPayload = await projectResponse.json();

    const briefResponse = await app.request(
      `/api/projects/${projectPayload.project.id}/briefs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentText:
            "Launch a summer sale for eco-friendly sneakers targeting Gen Z with a minimalist aesthetic",
          placements: ["square_1_1"]
        })
      }
    );

    const briefPayload = await briefResponse.json();
    expect(briefPayload.brief.intentText).toContain("Launch a summer sale");

    const getBriefResponse = await app.request(`/api/briefs/${briefPayload.brief.id}`);
    const getBriefPayload = await getBriefResponse.json();
    expect(getBriefPayload.brief.id).toBe(briefPayload.brief.id);
  });
});
