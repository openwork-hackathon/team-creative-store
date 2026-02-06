import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

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

type PrismaLike = {
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
  };
};

const marketplaceQuerySchema = z.object({
  search: z.string().optional(),
  assetType: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  licenseType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12)
});

export type MarketRoutesDeps = {
  prisma: PrismaLike;
};

export function createMarketRoutes({ prisma }: MarketRoutesDeps) {
  const market = new Hono();

  market.get("/listings", zValidator("query", marketplaceQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const { search, assetType, priceMin, priceMax, licenseType, page, limit } = query;

    // Build where clause for filtering
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } }
      ];
    }

    if (assetType) {
      where.assetType = assetType;
    }

    if (licenseType) {
      where.licenseType = licenseType;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (priceMin !== undefined) {
        priceFilter.gte = priceMin;
      }
      if (priceMax !== undefined) {
        priceFilter.lte = priceMax;
      }
      where.priceAicc = priceFilter;
    }

    // Get total count for pagination
    const total = await prisma.publishRecord.count({ where });
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch listings with creator info
    const publishRecords = await prisma.publishRecord.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            walletAddress: true
          }
        }
      },
      orderBy: { publishedAt: "desc" },
      skip: offset,
      take: limit
    });

    // Transform to marketplace listing format
    const listings = publishRecords.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      imageUrl: record.imageUrl ?? "https://placehold.co/600x400/1a1a2e/ffffff?text=No+Preview",
      creatorId: record.creatorId,
      creator: {
        id: record.creator.id,
        name: record.creator.name,
        walletAddress: record.creator.walletAddress
      },
      priceAicc: String(record.priceAicc),
      assetType: record.assetType,
      licenseType: record.licenseType,
      rating: String(record.rating),
      reviewCount: record.reviewCount,
      isPremium: record.isPremium,
      tags: record.tags,
      status: record.status,
      createdAt: record.publishedAt.toISOString()
    }));

    return c.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  });

  market.get("/listings/:id", async (c) => {
    const { id } = c.req.param();
    
    const record = await prisma.publishRecord.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            walletAddress: true
          }
        }
      }
    });

    if (!record) {
      return c.json({ error: "not_found" }, 404);
    }

    const listing = {
      id: record.id,
      title: record.title,
      description: record.description,
      imageUrl: record.imageUrl ?? "https://placehold.co/600x400/1a1a2e/ffffff?text=No+Preview",
      creatorId: record.creatorId,
      creator: {
        id: record.creator.id,
        name: record.creator.name,
        walletAddress: record.creator.walletAddress
      },
      priceAicc: String(record.priceAicc),
      assetType: record.assetType,
      licenseType: record.licenseType,
      rating: String(record.rating),
      reviewCount: record.reviewCount,
      isPremium: record.isPremium,
      tags: record.tags,
      status: record.status,
      createdAt: record.publishedAt.toISOString()
    };

    return c.json({ listing });
  });

  // Get asset types for filter dropdown
  market.get("/asset-types", (c) => {
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
  market.get("/license-types", (c) => {
    return c.json({
      licenseTypes: [
        { value: "standard", label: "Standard" },
        { value: "extended", label: "Extended" },
        { value: "exclusive", label: "Exclusive" }
      ]
    });
  });

  return market;
}
