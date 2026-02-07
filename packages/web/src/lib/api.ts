import type { PlacementSpecKey, AiCreativeOutput, BrandAsset } from "@creative-store/shared";

export type ProjectStatus = "draft" | "generating" | "ready" | "published";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  imageUrl: string;
  updatedAt: string;
};

export type ProjectsResponse = {
  projects: Project[];
};

type CreateBriefInput = {
  intentText: string;
  placements: PlacementSpecKey[];
  industry?: string;
  sensitiveWords?: string[];
};

type ParseBriefInput = CreateBriefInput;

type GenerateCreativeInput = {
  briefId: string;
  placement: PlacementSpecKey;
  brandAssets?: BrandAsset[];
};

export type MarketplaceQuery = {
  search?: string;
  assetType?: string;
  priceMin?: number;
  priceMax?: number;
  licenseType?: string;
  page?: number;
  limit?: number;
};

export type AssetType = {
  value: string;
  label: string;
};

export type PublishProjectInput = {
  title: string;
  description?: string;
  imageUrl?: string;
  category: "ads" | "branding" | "e_commerce" | "gaming";
  assetType?: "ad_kit" | "branding" | "character" | "ui_kit" | "background" | "template" | "logo" | "scene_3d";
  licenseType: "standard" | "extended" | "exclusive";
  tags: string[];
  price: number;
  isPremium?: boolean;
  includeSourceFiles: boolean;
};

export type PublishProjectResponse = {
  publishRecord: {
    id: string;
    slug: string;
    title: string;
    publishedAt: string;
  };
};

export type LicenseType = {
  value: string;
  label: string;
};

// MarketplaceListing type based on PublishRecord
export type MarketplaceListing = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  creatorId: string;
  creator: {
    id: string;
    name: string | null;
    walletAddress: string | null;
  };
  priceAicc: string;
  assetType: string;
  licenseType: string;
  rating: string;
  reviewCount: number;
  isPremium: boolean;
  tags: string[];
  status: string;
  createdAt: string;
};

export type MarketplaceListingsResponse = {
  listings: MarketplaceListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type MarketplaceListingResponse = {
  listing: MarketplaceListing;
};

export function createApiClient(
  fetcher: typeof fetch = fetch,
  baseUrl = "/api"
) {
  const request = (input: RequestInfo, init?: RequestInit) =>
    fetcher(input, { credentials: "include", ...init });

  return {
    createProject: async (name: string) =>
      request(`${baseUrl}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      }).then((response) => response.json()),
    listProjects: async (): Promise<ProjectsResponse> =>
      request(`${baseUrl}/projects`).then((response) => response.json()),
    getProjects: async (search?: string, status?: ProjectStatus, recency?: string): Promise<ProjectsResponse> => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (recency) params.set("recency", recency);
      const query = params.toString();
      return request(`${baseUrl}/projects${query ? `?${query}` : ""}`).then((response) => response.json());
    },
    deleteProject: async (id: string): Promise<void> =>
      request(`${baseUrl}/projects/${id}`, {
        method: "DELETE"
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete project");
        }
      }),
    createBrief: async (projectId: string, input: CreateBriefInput) =>
      request(`${baseUrl}/projects/${projectId}/briefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json()),
    getBrief: async (briefId: string) =>
      request(`${baseUrl}/briefs/${briefId}`).then((response) => response.json()),
    getCurrentUser: async () =>
      request(`${baseUrl}/user/@me`).then((response) => response.json()),
    parseBriefWithAi: async (input: ParseBriefInput) =>
      request(`${baseUrl}/ai/brief/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json()),
    generateCreative: async (input: GenerateCreativeInput) =>
      request(`${baseUrl}/ai/creative/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json() as Promise<{ draft?: unknown; creative?: AiCreativeOutput }>),
    uploadLogo: async (formData: FormData) =>
      request(`${baseUrl}/uploads/logo`, {
        method: "POST",
        body: formData
      }).then((response) => response.json()),
    uploadVisuals: async (formData: FormData) =>
      request(`${baseUrl}/uploads/visuals`, {
        method: "POST",
        body: formData
      }).then((response) => response.json()),
    getAssetTypes: async (): Promise<{ assetTypes: AssetType[] }> =>
      request(`${baseUrl}/marketplace/asset-types`).then((response) => response.json()),
    getLicenseTypes: async (): Promise<{ licenseTypes: LicenseType[] }> =>
      request(`${baseUrl}/marketplace/license-types`).then((response) => response.json()),
    // Project publish API
    publishProject: async (projectId: string, input: PublishProjectInput): Promise<PublishProjectResponse> =>
      request(`${baseUrl}/projects/${projectId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json()),
    // Marketplace API
    getMarketplaceListings: async (query: MarketplaceQuery): Promise<MarketplaceListingsResponse> => {
      const params = new URLSearchParams();
      if (query.search) params.set("search", query.search);
      if (query.assetType) params.set("assetType", query.assetType);
      if (query.priceMin !== undefined) params.set("priceMin", String(query.priceMin));
      if (query.priceMax !== undefined) params.set("priceMax", String(query.priceMax));
      if (query.licenseType) params.set("licenseType", query.licenseType);
      if (query.page !== undefined) params.set("page", String(query.page));
      if (query.limit !== undefined) params.set("limit", String(query.limit));
      return request(`${baseUrl}/marketplace/listings?${params.toString()}`).then((response) => response.json());
    },
    getMarketplaceListing: async (id: string): Promise<MarketplaceListingResponse> =>
      request(`${baseUrl}/marketplace/listings/${id}`).then((response) => response.json())
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
