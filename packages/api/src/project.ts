import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { zCreateBriefInput } from "@creative-store/shared";
import { buildBriefJsonFromInput } from "./brief-analysis";
import { parseBriefWithAi } from "./ai-creative";

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Updated just now";
  if (diffMins < 60) return `Updated ${diffMins} mins ago`;
  if (diffHours < 24) return `Updated ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `Updated ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `Updated on ${date.toLocaleDateString()}`;
}

export type SessionUser = { id: string };

export type AppEnv = {
  Variables: {
    user: SessionUser | null;
  };
};

type ProjectRecord = {
  id: string;
  name: string;
  status: string;
  imageUrl: string | null;
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
  };
};

export type ProjectRoutesDeps = {
  prisma: PrismaLike;
};

export function createProjectRoutes({ prisma }: ProjectRoutesDeps) {
  const routes = new Hono<AppEnv>();

  routes.get("/", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" }
    });
    
    // Transform to frontend format
    const formattedProjects = projects.map((p) => ({
      id: p.id,
      title: p.name,
      status: p.status,
      imageUrl: p.imageUrl ?? "https://placehold.co/600x400/1a1a2e/ffffff?text=No+Preview",
      updatedAt: formatRelativeTime(p.updatedAt)
    }));
    
    return c.json({ projects: formattedProjects });
  });

  routes.post(
    "/",
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

  routes.post(
    "/:projectId/briefs",
    zValidator(
      "json",
      zCreateBriefInput.omit({ projectId: true })
    ),
    async (c) => {
      const user = c.get("user") as SessionUser | null;
      if (!user) return c.json({ error: "unauthorized" }, 401);

      const { projectId } = c.req.param();
      const input = c.req.valid("json");

      let briefJson;
      try {
        const result = await parseBriefWithAi({
          intentText: input.intentText,
          industry: input.industry,
          placements: input.placements,
          sensitiveWords: input.sensitiveWords
        });
        briefJson = result.briefJson;
      } catch (error) {
        console.error("[Brief] AI parsing failed, using fallback:", error);
        briefJson = buildBriefJsonFromInput({
          intentText: input.intentText,
          industry: input.industry,
          placements: input.placements,
          sensitiveWords: input.sensitiveWords
        });
      }

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

  return routes;
}
