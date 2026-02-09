import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { PLACEMENT_SPECS, zCreateBriefInput } from "@creative-store/shared";
import { buildBriefJsonFromInput } from "./brief-analysis";

type SessionUser = { id: string };
type Session = { user: SessionUser } | null;

type MarketplaceListing = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  creatorId: string;
  creator: { id: string; name: string | null };
  priceAicc: unknown;
  assetType: string;
  licenseType: string;
  rating: unknown;
  reviewCount: number;
  isPremium: boolean;
  tags: string[];
  status: string;
  createdAt: Date;
};

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
  marketplaceListing: {
    findMany: (args: {
      where?: Record<string, unknown>;
      include?: { creator: boolean };
      orderBy?: Record<string, string>;
      skip?: number;
      take?: number;
    }) => Promise<MarketplaceListing[]>;
    findUnique: (args: { where: { id: string }; include?: { creator: boolean } }) => Promise<MarketplaceListing | null>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
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

  // --- Creative / Preview Studio API ---
  
  // Mock creative data storage (in-memory for demo)
  const mockCreatives: Record<string, { id: string; title: string; specKey: string; status: string; content: unknown; userId: string; createdAt: string; updatedAt: string }> = {};

  app.get("/api/creatives", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    
    const userCreatives = Object.values(mockCreatives).filter((c) => c.userId === user.id);
    return c.json({ creatives: userCreatives });
  });

  app.get("/api/creatives/:id", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const { id } = c.req.param();
    const creative = mockCreatives[id];
    if (!creative) return c.json({ error: "not_found" }, 404);
    return c.json({ creative });
  });

  app.post("/api/creatives", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    
    const body = await c.req.json();
    const id = `creative_${Date.now()}`;
    const now = new Date().toISOString();
    
    mockCreatives[id] = {
      id,
      title: body.title || "Untitled Creative",
      specKey: body.specKey || "story_9_16",
      status: "draft",
      content: body.content || {},
      userId: user.id,
      createdAt: now,
      updatedAt: now
    };
    
    return c.json({ creative: mockCreatives[id] });
  });

  app.patch("/api/creatives/:id", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const { id } = c.req.param();
    const creative = mockCreatives[id];
    if (!creative) return c.json({ error: "not_found" }, 404);
    
    const body = await c.req.json();
    mockCreatives[id] = {
      ...creative,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.specKey !== undefined && { specKey: body.specKey }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.content !== undefined && { content: body.content }),
      updatedAt: new Date().toISOString()
    };
    
    return c.json({ creative: mockCreatives[id] });
  });

  app.post("/api/creatives/:id/publish", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const { id } = c.req.param();
    const creative = mockCreatives[id];
    if (!creative) return c.json({ error: "not_found" }, 404);
    
    mockCreatives[id] = {
      ...creative,
      status: "published",
      updatedAt: new Date().toISOString()
    };
    
    return c.json({ creative: mockCreatives[id] });
  });

  // --- Independent AI Fix API (works without creative ID) ---
  app.post("/api/ai/optimize", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    
    const body = await c.req.json();
    const { specKey, content } = body;
    
    // Mock AI optimization response
    return c.json({ 
      ok: true, 
      message: "AI optimization completed",
      suggestions: [
        "Adjusted text size for better readability",
        "Optimized color contrast for accessibility",
        "Balanced layout composition",
        "Enhanced visual hierarchy with font weight adjustments"
      ],
      optimizedContent: {
        ...content,
        aiOptimized: true,
        optimizedAt: new Date().toISOString()
      }
    });
  });

  // AI fix for existing creative (requires creative ID)
  app.post("/api/creatives/:id/ai-fix", async (c) => {
    const user = c.get("user") as SessionUser | null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const { id } = c.req.param();
    const creative = mockCreatives[id];
    if (!creative) return c.json({ error: "not_found" }, 404);
    
    // Mock AI auto-fix response
    return c.json({ 
      ok: true, 
      message: "AI optimization applied",
      suggestions: [
        "Adjusted text size for better readability",
        "Optimized color contrast",
        "Balanced layout composition"
      ]
    });
  });

  // --- Marketplace API ---
  const marketplaceQuerySchema = z.object({
    search: z.string().optional(),
    assetType: z.string().optional(),
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    licenseType: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(12)
  });

  // Mock data for marketplace listings (until database is seeded)
  const mockListings = [
    {
      id: "listing_1",
      title: "Cyberpunk Ad Kit",
      description: "Futuristic neon city cyberpunk ad kit with multiple variations",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUZytVFaCmTRzQa9VAoGYy9u1-_JWyHZzrIgFguhZQ6X8DZpoTmTs4mRjJzOZEQOQ0CDZLImOKtAxFm1eP1u0KgcbMSxbpAIg6-Inrs8qqoiGdm1Z71zxJ43SnO5snp_5JgNBQlJ2A4WL2THsAXTvp9wqNldeKNziUVLJq9cIIQmVdbOf81W8RZSR0qVPP2Sc8x-sCuWPKJXlqVXRqB188xtuP3G4729oLzXUmLCTqxw5qtk9yDwd828iZBaDA0TH5EuNYMlcPg1E",
      creatorId: "creator_1",
      creator: { id: "creator_1", name: "CreatorX" },
      priceAicc: "45.00",
      assetType: "ad_kit",
      licenseType: "standard",
      rating: "4.8",
      reviewCount: 124,
      isPremium: true,
      tags: ["cyberpunk", "neon", "futuristic"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_2",
      title: "Neural Branding Pack",
      description: "Abstract brain connections neural branding assets",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKFC0Y0m4zwj85i19V0fxuQucF5Fj7iA3RV3bFc-Hi0rPlUHzACxh7TStc3XWRTjBRTsQFiaHOCxpcUomx43iLoC85TWiRuIl50bcXseO9mnSbWrY1TcO5MQXNp6uniQH5RX1jxGoCLuB5tRwKSHJCfo5iF67PiyiOZiwr4KXbSTslV3wIbnOYlQCD94ZrsC056thhttZKoCwYFXM6t08Ie4vyZBCKKiQ3hCKYjPptwAKMSbNzi0wAqbx15nP3eZ1LsC9q79zJOBs",
      creatorId: "creator_2",
      creator: { id: "creator_2", name: "AI_Artist" },
      priceAicc: "120.00",
      assetType: "branding",
      licenseType: "extended",
      rating: "4.9",
      reviewCount: 89,
      isPremium: false,
      tags: ["neural", "branding", "abstract"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_3",
      title: "AI Character Assets",
      description: "High quality character render collection",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEtQDs383AO4YQ6bxP_dcoI1drTj-e5wY2NYzfLsh0JHRen43L_jtCn6DhHbdhUxAQOyPpgz-tkhOzr9KFfcfaG-JtATzyoIbLUvlkoCONFPRcxo0xOjojvYMg6-6qe1lXEag5nm_Z_aZ_sjCA_6T-SfdgQAXdckBo4yIkleLLFi-cOwi9zbqmtEC3HJDvuOpQofDgOBt3u_ldqeKA99OT_jGLlOnEtQYvjERVUfZKdUZp55grpKvCxn_i2B_uP-wA8sWApJbLTvI",
      creatorId: "creator_3",
      creator: { id: "creator_3", name: "NFT_Master" },
      priceAicc: "30.00",
      assetType: "character",
      licenseType: "standard",
      rating: "4.5",
      reviewCount: 56,
      isPremium: false,
      tags: ["character", "3d", "render"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_4",
      title: "Futuristic UI Kit",
      description: "Glassmorphism UI components pack",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5wR7Df7LtQ37thayHsuVoDXLyIdKOE4t8gjHZM3uKST3DrHv9u6aD-rYFLZou0kSxHlBJNSzG_T8_YZ0wRPNGdOuqUsh8kh79-aAQC8gIEtrYpp_rz4eRErR2-cXBjAOGjLtCpMwY3vU7zgKoxabrST41JUBkAalzqhx6_E4O6w9s9yk-0Eo8UuFZvGNeyj4DN5gSUTcgLTpP--nbVbL-3RYTsRtqu6ss5pU0opkzrLp8fLqOpjq1jNa_SZDAIB_tdaXkpivI4Ig",
      creatorId: "creator_4",
      creator: { id: "creator_4", name: "PixelPerfect" },
      priceAicc: "85.00",
      assetType: "ui_kit",
      licenseType: "standard",
      rating: "4.7",
      reviewCount: 203,
      isPremium: false,
      tags: ["ui", "glassmorphism", "components"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_5",
      title: "Abstract Motion BG",
      description: "Fluid liquid motion backgrounds",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8IC5Mi2MfF_lh1B3zc758Un3No85aq6L0_3XiOe0q8wsGt_dNX2bpRmjskSJv6K4aXJGWseeL2NPkh1mHF6KFZK0EPeLNhQBxMKh-ni5vQykAQb9ru0MaRTJr04u7WmU9w3vZGep3ItpxScetROxEpNYXxTm-ewqFMDUVrv6fWXXVpIXfLfrWXkF2Xba67ZJV_6na48Bdpy7n9KKf8PcU7xq-WHCGm1tHarzrmObkXdTwGSUTD37GEm-L9CL0qEjVa2J1qzpNaGg",
      creatorId: "creator_5",
      creator: { id: "creator_5", name: "MotionDesign" },
      priceAicc: "60.00",
      assetType: "background",
      licenseType: "standard",
      rating: "4.6",
      reviewCount: 78,
      isPremium: false,
      tags: ["motion", "background", "abstract"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_6",
      title: "Dynamic Ad Templates",
      description: "Variable social media ad templates",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdUmHP1IofzkUO0oX5YAVezEsBPIdJ_eiomXibfr1Re4NW8pFUupZo9IICPSDeaHe2O2dnbPqYIPfyBymD93aTAlC0l3Hz5zJehr0jy9Gi-_rxkh07BRTaznueANTe6IngSoGISPJrTiGkIm1D3Du1JlXFSStZO3WjHQVxrSp11Wd3NZjE-i-fzKhy8CPiwvla9lBbs_d6waZB53R1nAq8T88ivIkPXZV0m3Cd9Fvq9ESLk7dqQFy4zFgESXmIT5_x6_hWwKVqCm4",
      creatorId: "creator_6",
      creator: { id: "creator_6", name: "AdPro" },
      priceAicc: "95.00",
      assetType: "template",
      licenseType: "extended",
      rating: "4.8",
      reviewCount: 167,
      isPremium: false,
      tags: ["template", "social", "ads"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_7",
      title: "Vector AI Logos",
      description: "Vector logo generation assets",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNGfwY5sIv6l_PiBA-0FPP-feqU09DD0EeuwOg_SPxkPPViwOpmML8v6K9JCJkMmF3ETJp0bRV7JUOhhBPsYWvKwuxCKxVTRuTZjHBdOpP0yOqixVWS45kK0dLTA1XPvyCj4J2_5mjyWIh8U3Wlvpb99GpwTUfojyENdNBnDing2osdHpMQil4h3lzttaZX_N-cgJ6oaGlC0fGpyD0XQ7YuHv8M_ci5pDJkKJ9-ERaX2EGdKE6K-fmYTAaH4GsnhvmJT2W3WSykNc",
      creatorId: "creator_7",
      creator: { id: "creator_7", name: "LogoGen" },
      priceAicc: "40.00",
      assetType: "logo",
      licenseType: "standard",
      rating: "4.4",
      reviewCount: 92,
      isPremium: false,
      tags: ["logo", "vector", "branding"],
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "listing_8",
      title: "3D Scene Generator",
      description: "Cinematic 3D environmental scenes",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ0Ms2r5gucNbO1UW-eE41L0At9g_5kPDjgorLhp8v-Ii8YLxbHm49xco_cHpunegusrB3USzrz9mQulAD7rSWOr3VCwQFeAzUngd0S8cPH55sVMzXeHmXN4mWMz6cmR3_PBg2WLe1w-8NhucgHQMAC-vwCqOcmZ9x0jRbhUv4Q7t5LcWRXo6qXAFAqrFMyyUfe4SVOJldnGiDu5IUcrYdwsoDJ5p95kE3gF3CrgbmBgulY0QrO9OnB_5qMY6v1BItezb705nxEuQ",
      creatorId: "creator_8",
      creator: { id: "creator_8", name: "3D_Viz" },
      priceAicc: "150.00",
      assetType: "scene_3d",
      licenseType: "exclusive",
      rating: "5.0",
      reviewCount: 45,
      isPremium: true,
      tags: ["3d", "scene", "cinematic"],
      status: "active",
      createdAt: new Date().toISOString()
    }
  ];

  app.get("/api/marketplace/listings", zValidator("query", marketplaceQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const { search, assetType, priceMin, priceMax, licenseType, page, limit } = query;

    // Filter mock data based on query params
    let filteredListings = [...mockListings];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = filteredListings.filter(
        (l) =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description?.toLowerCase().includes(searchLower) ||
          l.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    if (assetType) {
      filteredListings = filteredListings.filter((l) => l.assetType === assetType);
    }

    if (priceMin !== undefined) {
      filteredListings = filteredListings.filter((l) => parseFloat(l.priceAicc) >= priceMin);
    }

    if (priceMax !== undefined) {
      filteredListings = filteredListings.filter((l) => parseFloat(l.priceAicc) <= priceMax);
    }

    if (licenseType) {
      filteredListings = filteredListings.filter((l) => l.licenseType === licenseType);
    }

    const total = filteredListings.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedListings = filteredListings.slice(offset, offset + limit);

    return c.json({
      listings: paginatedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  });

  app.get("/api/marketplace/listings/:id", async (c) => {
    const { id } = c.req.param();
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) return c.json({ error: "not_found" }, 404);
    return c.json({ listing });
  });

  // Get asset types for filter dropdown
  app.get("/api/marketplace/asset-types", (c) => {
    return c.json({
      assetTypes: [
        { value: "ad_kit", label: "Ad Kit" },
        { value: "branding", label: "Branding" },
        { value: "character", label: "Character" },
        { value: "ui_kit", label: "UI Kit" },
        { value: "background", label: "Background" },
        { value: "template", label: "Template" },
        { value: "logo", label: "Logo" },
        { value: "scene_3d", label: "3D Scene" }
      ]
    });
  });

  // Get license types for filter dropdown
  app.get("/api/marketplace/license-types", (c) => {
    return c.json({
      licenseTypes: [
        { value: "standard", label: "Standard" },
        { value: "extended", label: "Extended" },
        { value: "exclusive", label: "Exclusive" }
      ]
    });
  });

  return app;
}
