import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app";

// Import the mocked module to access the mock function
const mockGenerateObject = vi.fn();
const mockGenerateText = vi.fn();
vi.mock("ai", () => ({
  generateObject: mockGenerateObject,
  generateText: mockGenerateText
}));

type Brief = { id: string; intentText: string; briefJson: unknown };
type Draft = { id: string; briefId: string; draftJson: unknown };

const originalApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

afterEach(() => {
  mockGenerateObject.mockReset();
  mockGenerateText.mockReset();
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalApiKey;
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
  it("parses briefs with AI", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    mockGenerateObject.mockResolvedValueOnce({
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
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    mockGenerateText.mockResolvedValueOnce({
      files: [
        {
          mediaType: "image/png",
          base64: "aGVsbG8="
        }
      ]
    });

    mockGenerateObject.mockResolvedValueOnce({
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
    expect(payload.creative.assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dataUrl: "data:image/png;base64,aGVsbG8="
        })
      ])
    );
    expect(payload.draft.draftJson.creative.html).not.toContain("<script");
  });

  it("returns error when AI generation fails", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    mockGenerateText.mockRejectedValueOnce(new Error("Network error"));

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

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("Network error");
    expect(payload.code).toBe("AI_ERROR");
  });

  it("returns error when AI brief parsing fails", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    mockGenerateObject.mockRejectedValueOnce(new Error("Rate limit exceeded"));

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

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("Rate limit exceeded");
    expect(payload.code).toBe("AI_ERROR");
  });

  it("returns error when GOOGLE_GENERATIVE_AI_API_KEY is not set", async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

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

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toBe("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set");
    expect(payload.code).toBe("MISSING_API_KEY");
  });
});
