import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  PLACEMENT_SPECS,
  zCreateBriefInput,
  zBrandAsset,
  zPlacementSpecKey
} from "@creative-store/shared";
import { generateCreativeImage, AiCreativeError } from "./ai-creative";
import { parseBriefWithAi, AiBriefError } from "./ai-brief";
import { createProjectRoutes, AppEnv, SessionUser } from "./project";
import { createMarketRoutes } from "./market";
import { createOrderRoutes } from "./order";
import { createTokenDataRoutes } from "./token-data";
import { dataUrlToBuffer, mimeTypeToExtension, StorageError, type S3Storage } from "./storage";

type Session = { user: SessionUser } | null;

type PublishRecordWithCreator = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  creatorId: string;
  creator: { id: string; name: string | null; walletAddress: string | null };
  priceAicc: unknown;
  assetType: string;
  licenseType: string;
  rating: unknown;
  reviewCount: number;
  isPremium: boolean;
  tags: string[];
  status: string;
  publishedAt: Date;
};

type ProjectRecord = {
  id: string;
  name: string;
  status: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type OrderRecord = {
  id: string;
  orderNumber: string;
  publishRecordId: string;
  publishRecord: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
  buyerId: string;
  priceAicc: unknown;
  licenseType: string;
  txHash: string | null;
  status: string;
  statusMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaLike = {
  project: {
    findMany: (args: { where: { userId: string }; orderBy?: { updatedAt: "desc" } }) => Promise<ProjectRecord[]>;
    findUnique: (args: { where: { id: string } }) => Promise<ProjectRecord | null>;
    create: (args: { data: { name: string; userId: string; status?: string; imageUrl?: string } }) => Promise<ProjectRecord>;
    update: (args: { where: { id: string }; data: { name?: string; status?: string; imageUrl?: string } }) => Promise<ProjectRecord>;
  };
  brief: {
    create: (args: { data: { projectId: string; intentText: string; briefJson: unknown; constraints: unknown } }) => Promise<unknown>;
    findUnique: (args: { where: { id: string } }) => Promise<unknown | null>;
  };
  draft: {
    create: (args: { data: { briefId: string; draftJson: unknown } }) => Promise<unknown>;
    findMany: (args: { where: { briefId: string }; orderBy: { createdAt: "desc" } }) => Promise<unknown[]>;
  };
  placementSpec: {
    upsert: (args: {
      where: { key: string };
      create: { key: string; width: number; height: number; safeArea: unknown; rules: unknown; category: string };
      update: { width: number; height: number; safeArea: unknown; rules: unknown; category: string };
    }) => Promise<unknown>;
  };
  publishRecord: {
    findMany: (args: {
      where?: Record<string, unknown>;
      include?: { creator: { select: { id: boolean; name: boolean; walletAddress: boolean } } };
      orderBy?: Record<string, string>;
      skip?: number;
      take?: number;
    }) => Promise<PublishRecordWithCreator[]>;
    findUnique: (args: {
      where: { id: string };
      include?: { creator: { select: { id: boolean; name: boolean; walletAddress: boolean } } };
    }) => Promise<PublishRecordWithCreator | null>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string; slug: string; title: string; publishedAt: Date }>;
  };
  order: {
    findMany: (args: {
      where?: Record<string, unknown>;
      include?: { publishRecord: { select: { id: boolean; title: boolean; imageUrl: boolean } } };
      orderBy?: Record<string, string>;
      skip?: number;
      take?: number;
    }) => Promise<OrderRecord[]>;
    findUnique: (args: {
      where: { id: string } | { orderNumber: string };
      include?: { publishRecord: { select: { id: boolean; title: boolean; imageUrl: boolean } } };
    }) => Promise<OrderRecord | null>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    create: (args: { data: Record<string, unknown> }) => Promise<OrderRecord>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<OrderRecord>;
    delete: (args: { where: { id: string } }) => Promise<OrderRecord>;
  };
};

type AppDeps = {
  prisma: PrismaLike;
  getSession: (headers: Headers) => Promise<Session>;
  storage: S3Storage;
};

type UploadedFileInfo = {
  name: string;
  size: number;
  type: string;
};

const collectFiles = (value: unknown): File[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item): item is File => item instanceof File);
  return value instanceof File ? [value] : [];
};

const mapFiles = (files: File[]): UploadedFileInfo[] =>
  files.map((file) => ({ name: file.name, size: file.size, type: file.type }));

export function createApp({ prisma, getSession, storage }: AppDeps) {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    const session = await getSession(c.req.raw.headers);
    c.set("user", session?.user ?? null);
    await next();
  });

  app.get("/health", (c) => c.json({ ok: true }));

  app.get("/debug/env", (c) => c.json({ 
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY?.length || 0
  }));

  app.post("/api/admin/seed/placement-specs", async (c) => {
    for (const spec of PLACEMENT_SPECS) {
      await prisma.placementSpec.upsert({
        where: { key: spec.key },
        create: {
          key: spec.key,
          width: spec.width,
          height: spec.height,
          safeArea: spec.safeArea,
          rules: spec.rules,
          category: spec.category
        },
        update: {
          width: spec.width,
          height: spec.height,
          safeArea: spec.safeArea,
          rules: spec.rules,
          category: spec.category
        }
      });
    }
    return c.json({ ok: true, count: PLACEMENT_SPECS.length });
  });

  // Mount project routes
  app.route("/api/projects", createProjectRoutes({ prisma }));

  // Mount order routes
  app.route("/api/orders", createOrderRoutes({ prisma }));

  app.get("/api/user/@me", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);
    return c.json({ user });
  });

  app.post("/api/uploads/logo", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const body = await c.req.parseBody();
    const files = collectFiles(body.files ?? body.file);
    return c.json({ ok: true, files: mapFiles(files) });
  });

  app.post("/api/uploads/visuals", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const body = await c.req.parseBody();
    const files = collectFiles(body.files ?? body.file);
    return c.json({ ok: true, files: mapFiles(files) });
  });

  app.post(
    "/api/ai/brief/parse",
    zValidator(
      "json",
      zCreateBriefInput.omit({ projectId: true })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "unauthorized" }, 401);
      const input = c.req.valid("json");
      try {
        const parsed = await parseBriefWithAi(input);
        return c.json(parsed);
      } catch (error) {
        if (error instanceof AiBriefError) {
          return c.json({ error: error.message, code: error.code }, 500);
        }
        const message = error instanceof Error ? error.message : "AI brief parsing failed";
        return c.json({ error: message, code: "AI_ERROR" }, 500);
      }
    }
  );

  app.post(
    "/api/ai/creative/generate",
    zValidator(
      "json",
      z.object({
        briefId: z.string().min(1),
        placement: zPlacementSpecKey,
        brandAssets: z.array(zBrandAsset).optional()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "unauthorized" }, 401);
      const input = c.req.valid("json");
      const brief = await prisma.brief.findUnique({ where: { id: input.briefId } });
      if (!brief) return c.json({ error: "not_found" }, 404);

      try {
        const result = await generateCreativeImage({
          placement: input.placement,
          brief: (brief as { briefJson?: unknown }).briefJson ?? {},
          intentText: (brief as { intentText?: string }).intentText,
          brandAssets: input.brandAssets
        });

        // Convert base64 data URL to buffer and upload to S3
        const { buffer, mimeType } = dataUrlToBuffer(result.imageDataUrl);
        const extension = mimeTypeToExtension(mimeType);
        const timestamp = Date.now();
        const s3Key = `creative-store-images/drafts/${input.briefId}/${timestamp}.${extension}`;

        const uploadResult = await storage.uploadImage({
          key: s3Key,
          data: buffer,
          contentType: mimeType
        });

        const draft = await prisma.draft.create({
          data: {
            briefId: input.briefId,
            draftJson: {
              placement: input.placement,
              imageUrl: uploadResult.url,
              aspectRatio: result.aspectRatio
            }
          }
        });

        return c.json({
          draft,
          image: { imageUrl: uploadResult.url, aspectRatio: result.aspectRatio }
        });
      } catch (error) {
        if (error instanceof AiCreativeError) {
          return c.json({ error: error.message, code: error.code }, 500);
        }
        if (error instanceof StorageError) {
          return c.json({ error: error.message, code: error.code }, 500);
        }
        const message = error instanceof Error ? error.message : "AI creative generation failed";
        return c.json({ error: message, code: "AI_ERROR" }, 500);
      }
    }
  );

  app.get("/api/briefs/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const { id } = c.req.param();
    const brief = await prisma.brief.findUnique({ where: { id } });
    if (!brief) return c.json({ error: "not_found" }, 404);
    return c.json({ brief });
  });

  app.post("/api/briefs/:id/generate-drafts", async (c) => {
    const { id } = c.req.param();
    return c.json({ ok: true, briefId: id, jobId: `gen_${id}` });
  });

  app.get("/api/briefs/:id/drafts", async (c) => {
    const { id } = c.req.param();
    const drafts = await prisma.draft.findMany({
      where: { briefId: id },
      orderBy: { createdAt: "desc" }
    });
    return c.json({ drafts });
  });

  // --- Marketplace API ---
  const marketRoutes = createMarketRoutes({ prisma });
  app.route("/api/marketplace", marketRoutes);

  // --- Token Data API (public, no auth required) ---
  const tokenDataRoutes = createTokenDataRoutes();
  app.route("/api/token", tokenDataRoutes);

  return app;
}
