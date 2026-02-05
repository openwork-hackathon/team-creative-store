import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app";
import { generateObject } from "ai";

type Brief = { id: string; intentText: string; briefJson: unknown };
type Draft = { id: string; briefId: string; draftJson: unknown };

vi.mock("ai", () => ({
  generateObject: vi.fn()
}));

const generateObjectMock = vi.mocked(generateObject);

afterEach(() => {
  generateObjectMock.mockReset();
});

const createMemoryPrisma = () => {
  const briefs: Brief[] = [
    {
      id: "brief_1",
      intentText: "Launch a sale for eco-friendly sneakers",
      briefJson: { industry: "Retail", keyBenefits: ["Eco-friendly"] }
    }
  ];
  const drafts: Draft[] = [];
  return {
    project: {
      findMany: async () => [],
      create: async () => ({ id: "proj_1", name: "Demo", userId: "user_1" })
    },
    brief: {
      create: async () => briefs[0],
      findUnique: async ({ where }: { where: { id: string } }) =>
        briefs.find((brief) => brief.id === where.id) ?? null
    },
    draft: {
      create: async ({ data }: { data: Draft }) => {
        const draft = { ...data, id: `draft_${drafts.length + 1}` };
        drafts.push(draft);
        return draft;
      },
      findMany: async () => drafts
    },
    placementSpec: {
      upsert: async () => ({})
    }
  };
};

describe("AI routes", () => {
  it("parses briefs with AI fallback data", async () => {
    generateObjectMock.mockResolvedValueOnce({
      object: {
        industry: "Retail",
        placements: ["square_1_1"],
        audience: { interests: ["Gen Z"] },
        keyBenefits: ["Eco-friendly"],
        compliance: { sensitiveWords: [] },
        proposedHook: "Launch a sale for eco-friendly sneakers"
      }
    });

    const app = createApp({
      prisma: createMemoryPrisma(),
      getSession: async () => ({ user: { id: "user_1" } })
    });

    const response = await app.request("/api/ai/brief/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intentText: "Launch a sale for eco-friendly sneakers",
        placements: ["square_1_1"]
      })
    });

    const payload = await response.json();
    expect(payload.briefJson.industry).toBe("Retail");
    expect(payload.briefJson.audience.interests).toContain("Gen Z");
  });

  it("generates creatives and stores a sanitized draft", async () => {
    generateObjectMock.mockResolvedValueOnce({
      object: {
        html: '<div><script>alert("x")</script><p>Hi</p></div>',
        assets: [{ label: "Logo" }],
        warnings: []
      }
    });

    const prisma = createMemoryPrisma();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } })
    });

    const response = await app.request("/api/ai/creative/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefId: "brief_1", placement: "square_1_1" })
    });

    const payload = await response.json();
    expect(payload.creative.html).toContain("<p>Hi</p>");
    expect(payload.creative.html).not.toContain("<script");
    expect(payload.draft.draftJson.creative.html).not.toContain("<script");
  });
});
