import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { z } from "zod";
import { zValidator } from "hono/validator";
import { prisma } from "@creative-store/db";
import { zCreateBriefInput, PLACEMENT_SPECS } from "@creative-store/shared";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

// Seed-like endpoint for placement specs (MVP only; remove or protect in prod)
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

app.post(
  "/api/projects/:projectId/briefs",
  zValidator(
    "json",
    zCreateBriefInput.extend({
      projectId: z.string().uuid()
    })
  ),
  async (c) => {
    const input = c.req.valid("json");

    const briefJson = {
      industry: input.industry,
      placements: input.placements,
      compliance: { sensitiveWords: input.sensitiveWords ?? [] }
    };

    const constraints = {
      placements: input.placements
    };

    const brief = await prisma.brief.create({
      data: {
        projectId: input.projectId,
        intentText: input.intentText,
        briefJson,
        constraints
      }
    });

    return c.json({ brief });
  }
);

// Placeholder: generate drafts async (worker will implement)
app.post("/api/briefs/:id/generate-drafts", async (c) => {
  const { id } = c.req.param();
  // TODO: enqueue BullMQ job
  return c.json({ ok: true, briefId: id, jobId: `gen_${id}` });
});

app.get("/api/briefs/:id/drafts", async (c) => {
  const { id } = c.req.param();
  const drafts = await prisma.draft.findMany({ where: { briefId: id }, orderBy: { createdAt: "desc" } });
  return c.json({ drafts });
});

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`[api] listening on :${port}`);
