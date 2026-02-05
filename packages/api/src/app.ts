import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { PLACEMENT_SPECS, zCreateBriefInput } from "@creative-store/shared";
import { buildBriefJsonFromInput } from "./brief-analysis";

type SessionUser = { id: string };
type Session = { user: SessionUser } | null;

type PrismaLike = {
  project: {
    findMany: (args: { where: { userId: string } }) => Promise<Array<{ id: string; name: string }>>;
    create: (args: { data: { name: string; userId: string } }) => Promise<{ id: string; name: string }>;
  };
  brief: {
    create: (args: { data: { projectId: string; intentText: string; briefJson: unknown; constraints: unknown } }) => Promise<unknown>;
    findUnique: (args: { where: { id: string } }) => Promise<unknown | null>;
  };
  draft: {
    findMany: (args: { where: { briefId: string }; orderBy: { createdAt: "desc" } }) => Promise<unknown[]>;
  };
  placementSpec: {
    upsert: (args: {
      where: { key: string };
      create: { key: string; width: number; height: number; safeArea: unknown; rules: unknown; category: string };
      update: { width: number; height: number; safeArea: unknown; rules: unknown; category: string };
    }) => Promise<unknown>;
  };
};

type AppDeps = {
  prisma: PrismaLike;
  getSession: (headers: Headers) => Promise<Session>;
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

export function createApp({ prisma, getSession }: AppDeps) {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const session = await getSession(c.req.raw.headers);
    c.set("user", session?.user ?? null);
    await next();
  });

  app.get("/health", (c) => c.json({ ok: true }));

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

  app.get("/api/projects", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const projects = await prisma.project.findMany({ where: { userId: user.id } });
    return c.json({ projects });
  });

  app.get("/api/user/@me", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    return c.json({ user });
  });

  // --- Wallet / Orders (mock for now) ---
  app.get("/api/wallet/summary", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);

    return c.json({
      summary: {
        address: "0x71C...4f92",
        aiccBalance: "1250.00"
      }
    });
  });

  app.get("/api/wallet/transactions", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);

    return c.json({
      transactions: [
        {
          id: "tx_1",
          type: "received",
          hash: "0x3f2...9a21",
          amount: "500.00",
          direction: "in",
          status: "confirmed",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
        },
        {
          id: "tx_2",
          type: "purchase",
          hash: "0x88d...12c8",
          amount: "150.00",
          direction: "out",
          status: "confirmed",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
        },
        {
          id: "tx_3",
          type: "failed",
          hash: "0xef9...442b",
          amount: "200.00",
          direction: "out",
          status: "reverted",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
        }
      ]
    });
  });

  app.get("/api/orders", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);

    return c.json({
      orders: [
        {
          id: "order_1",
          creativeTitle: "Summer Sale Banner Pack",
          licenseType: "standard",
          priceAicc: "150.00",
          status: "confirmed",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
        }
      ]
    });
  });

  app.post("/api/uploads/logo", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const body = await c.req.parseBody();
    const files = collectFiles(body.files ?? body.file);
    return c.json({ ok: true, files: mapFiles(files) });
  });

  app.post("/api/uploads/visuals", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const body = await c.req.parseBody();
    const files = collectFiles(body.files ?? body.file);
    return c.json({ ok: true, files: mapFiles(files) });
  });

  app.post(
    "/api/projects",
    zValidator("json", z.object({ name: z.string().min(1) })),
    async (c) => {
      const user = c.get("user") as SessionUser | null;
      if (!user) return c.json({ error: "unauthorized" }, 401);
      const input = c.req.valid("json");
      const project = await prisma.project.create({
        data: { name: input.name, userId: user.id }
      });
      return c.json({ project });
    }
  );

  app.post(
    "/api/projects/:projectId/briefs",
    zValidator(
      "json",
      zCreateBriefInput.omit({ projectId: true })
    ),
    async (c) => {
      const user = c.get("user") as SessionUser | null;
      if (!user) return c.json({ error: "unauthorized" }, 401);

      const { projectId } = c.req.param();
      const input = c.req.valid("json");
      const briefJson = buildBriefJsonFromInput({
        intentText: input.intentText,
        industry: input.industry,
        placements: input.placements,
        sensitiveWords: input.sensitiveWords
      });

      const constraints = {
        placements: input.placements
      };

      const brief = await prisma.brief.create({
        data: {
          projectId,
          intentText: input.intentText,
          briefJson,
          constraints
        }
      });

      return c.json({ brief });
    }
  );

  app.get("/api/briefs/:id", async (c) => {
    const user = c.get("user") as SessionUser | null;
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

  return app;
}
