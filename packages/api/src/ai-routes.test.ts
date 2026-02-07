import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApp } from "./app";
import type { S3Storage } from "./storage";

// Mock must be hoisted with factory function
vi.mock("ai", () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
  Output: {
    object: vi.fn().mockReturnValue({ type: "object" })
  },
  stepCountIs: vi.fn().mockReturnValue(() => false)
}));

// Import after mocking
import { generateObject, generateText } from "ai";
const mockGenerateObject = generateObject as Mock;
const mockGenerateText = generateText as Mock;

// Create mock storage
const createMockStorage = (): S3Storage => ({
  uploadImage: vi.fn().mockImplementation(async ({ key }) => ({
    url: `https://test-bucket.s3.us-east-1.amazonaws.com/${key}`,
    key
  }))
});

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
  it("parses briefs with AI using two-phase research", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    
    // Phase 1: Research phase mock (conductResearch uses generateText with tools)
    mockGenerateText.mockResolvedValueOnce({
      text: "Brand Overview: EcoStep is a sustainable footwear company...",
      steps: [
        {
          providerMetadata: {
            google: {
              groundingMetadata: {
                groundingChunks: [
                  {
                    web: {
                      uri: "https://example.com/ecostep",
                      title: "EcoStep Brand"
                    },
                    retrievedContext: { text: "EcoStep makes eco-friendly sneakers..." }
                  }
                ]
              }
            }
          }
        }
      ]
    });

    // Phase 2: Extraction phase mock (extractBrief uses generateText with Output.object)
    mockGenerateText.mockResolvedValueOnce({
      output: {
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
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: createMockStorage()
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
    expect(payload.sources).toHaveLength(1);
    expect(payload.sources[0].url).toBe("https://example.com/ecostep");
    expect(payload.researchSummary).toContain("EcoStep");
    expect(payload.stepCount).toBe(1);
  });

  it("generates image and stores draft", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    mockGenerateText.mockResolvedValueOnce({
      files: [
        {
          mediaType: "image/png",
          base64: "aGVsbG8="
        }
      ]
    });

    const prisma = createMemoryPrisma();
    const mockStorage = createMockStorage();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: mockStorage
    });

    const response = await app.request("/api/ai/creative/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefId: "brief_1", placement: "square_1_1" })
    });

    const payload = await response.json();
    // Image URL should be S3 URL with creative-store-images prefix
    expect(payload.image.imageUrl).toMatch(/^https:\/\/test-bucket\.s3\.us-east-1\.amazonaws\.com\/creative-store-images\/drafts\/brief_1\/\d+\.png$/);
    expect(payload.image.aspectRatio).toBe("1:1");
    expect(payload.draft.draftJson.imageUrl).toMatch(/^https:\/\/test-bucket\.s3\.us-east-1\.amazonaws\.com\/creative-store-images\/drafts\/brief_1\/\d+\.png$/);
    expect(payload.draft.draftJson.aspectRatio).toBe("1:1");
    // Verify storage was called
    expect(mockStorage.uploadImage).toHaveBeenCalledTimes(1);
  });

  it("generates image with logo overlay when logo asset provided", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    
    // Phase 1: Base image generation
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "YmFzZV9pbWFnZQ==" }]
    });
    
    // Phase 2: Logo overlay
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "bG9nb19vdmVybGF5" }]
    });

    const prisma = createMemoryPrisma();
    const mockStorage = createMockStorage();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: mockStorage
    });

    const response = await app.request("/api/ai/creative/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        briefId: "brief_1",
        placement: "square_1_1",
        brandAssets: [
          {
            kind: "logo",
            mimeType: "image/png",
            dataBase64: "bG9nbw==",
            name: "Brand Logo"
          }
        ]
      })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    
    // Should have 2 generateText calls (base + logo overlay)
    expect(mockGenerateText).toHaveBeenCalledTimes(2);
    
    // Final image should be uploaded to S3 with creative-store-images prefix
    expect(payload.image.imageUrl).toMatch(/^https:\/\/test-bucket\.s3\.us-east-1\.amazonaws\.com\/creative-store-images\/drafts\/brief_1\/\d+\.png$/);
    expect(mockStorage.uploadImage).toHaveBeenCalledTimes(1);
  });

  it("generates image with product and reference assets", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "cHJvZHVjdF9pbWFnZQ==" }]
    });

    const prisma = createMemoryPrisma();
    const mockStorage = createMockStorage();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: mockStorage
    });

    const response = await app.request("/api/ai/creative/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        briefId: "brief_1",
        placement: "feed_4_5",
        brandAssets: [
          {
            kind: "product",
            mimeType: "image/jpeg",
            dataBase64: "cHJvZHVjdA==",
            name: "Product Shot"
          },
          {
            kind: "reference",
            mimeType: "image/png",
            dataBase64: "cmVmZXJlbmNl",
            name: "Mood Board"
          }
        ]
      })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    
    // Should only have 1 generateText call (no logo overlay needed)
    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    
    // Verify the call included product and reference assets
    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.messages[0].content).toHaveLength(3); // prompt + product + reference
    
    // Verify aspect ratio is correct for feed_4_5
    expect(payload.image.aspectRatio).toBe("4:5");
    
    // Verify S3 upload was called
    expect(mockStorage.uploadImage).toHaveBeenCalledTimes(1);
  });

  it("returns error when AI generation fails", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    mockGenerateText.mockRejectedValueOnce(new Error("Network error"));

    const prisma = createMemoryPrisma();
    const app = createApp({
      prisma,
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: createMockStorage()
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

  it("returns error when AI brief parsing fails in research phase", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    // Research phase fails
    mockGenerateText.mockRejectedValueOnce(new Error("Rate limit exceeded"));

    const app = createApp({
      prisma: createMemoryPrisma(),
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: createMockStorage()
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

  it("returns error when AI brief extraction fails", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    
    // Research phase succeeds
    mockGenerateText.mockResolvedValueOnce({
      text: "Research summary...",
      steps: []
    });
    
    // Extraction phase fails
    mockGenerateText.mockRejectedValueOnce(new Error("Extraction failed"));

    const app = createApp({
      prisma: createMemoryPrisma(),
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: createMockStorage()
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
    expect(payload.error).toBe("Extraction failed");
    expect(payload.code).toBe("AI_ERROR");
  });

  it("returns error when GOOGLE_GENERATIVE_AI_API_KEY is not set", async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    // Mock generateText to throw API key error like the SDK would
    mockGenerateText.mockRejectedValueOnce(new Error("Google Generative AI API key is missing"));

    const app = createApp({
      prisma: createMemoryPrisma(),
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: createMockStorage()
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
    expect(payload.error).toContain("API key");
    expect(payload.code).toBe("AI_ERROR");
  });

  it("adds warning when no sources found during research", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    
    // Research phase with no grounding sources
    mockGenerateText.mockResolvedValueOnce({
      text: "Could not find specific information about this brand...",
      steps: [{ providerMetadata: {} }]
    });

    // Extraction phase
    mockGenerateText.mockResolvedValueOnce({
      output: {
        industry: "Retail",
        audience: { interests: [] },
        keyBenefits: [],
        compliance: { sensitiveWords: [] }
      }
    });

    const app = createApp({
      prisma: createMemoryPrisma(),
      getSession: async () => ({ user: { id: "user_1" } }),
      storage: createMockStorage()
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
    expect(payload.warnings).toContain("No Google Search sources found during research phase.");
    expect(payload.sources).toHaveLength(0);
  });
});
