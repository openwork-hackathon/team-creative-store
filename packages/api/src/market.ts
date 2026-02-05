import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

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

const marketplaceQuerySchema = z.object({
  search: z.string().optional(),
  assetType: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  licenseType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12)
});

export function createMarketRoutes() {
  const market = new Hono();

  market.get("/listings", zValidator("query", marketplaceQuerySchema), async (c) => {
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

  market.get("/listings/:id", async (c) => {
    const { id } = c.req.param();
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) return c.json({ error: "not_found" }, 404);
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
