import type { PlacementSpecKey, GeneratedImage, BrandAsset } from "@creative-store/shared";

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

export type Order = {
  id: string;
  orderNumber: string;
  creativeTitle: string;
  imageUrl: string | null;
  licenseType: string;
  priceAicc: string;
  status: "pending" | "confirmed" | "failed";
  statusMessage: string | null;
  txHash: string | null;
  createdAt: string;
};

export type OrdersQuery = {
  status?: "pending" | "confirmed" | "failed";
  page?: number;
  limit?: number;
};

export type OrdersResponse = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type OrderResponse = {
  order: Order;
};

export type CreateOrderInput = {
  publishRecordId: string;
  txHash?: string;
  licenseType?: "standard" | "extended" | "exclusive";
};

export type CreateOrderResponse = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
  };
};

export type UpdateOrderInput = {
  status?: "pending" | "confirmed" | "failed";
  statusMessage?: string;
  txHash?: string;
};

export type UpdateOrderResponse = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    statusMessage: string | null;
    txHash: string | null;
    updatedAt: string;
  };
};

export type CheckPurchaseResponse = {
  purchased: boolean;
  order?: {
    id: string;
    orderNumber: string;
    licenseType: string;
    createdAt: string;
  };
};

export type BatchCheckPurchaseInput = {
  publishRecordIds: string[];
};

export type BatchCheckPurchaseResponse = {
  purchasedMap: Record<string, boolean>;
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

// Brief and Draft types for loading existing data
export type Draft = {
  id: string;
  briefId: string;
  draftJson: {
    placement: PlacementSpecKey;
    imageUrl: string;
    aspectRatio: string;
  };
  createdAt: string;
};

export type Brief = {
  id: string;
  projectId: string;
  intentText: string;
  briefJson: unknown;
  constraints: unknown;
  status: string;
  createdAt: string;
  drafts?: Draft[];
};

export type BriefsResponse = {
  briefs: Brief[];
};

export type DraftsResponse = {
  drafts: Draft[];
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
    getProjects: async (status?: ProjectStatus, recency?: string): Promise<ProjectsResponse> => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (recency) params.set("recency", recency);
      const query = params.toString();
      return request(`${baseUrl}/projects${query ? `?${query}` : ""}`).then((response) => response.json());
    },
    getProject: async (id: string): Promise<{ project: Project & { creatives?: Array<{ id: string }> } }> =>
      request(`${baseUrl}/projects/${id}`).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to get project");
        }
        return response.json();
      }),
    updateProject: async (id: string, data: { name?: string; status?: ProjectStatus; imageUrl?: string }): Promise<{ project: Project }> =>
      request(`${baseUrl}/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to update project");
        }
        return response.json();
      }),
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
      }).then((response) => response.json() as Promise<{ draft?: unknown; image?: GeneratedImage }>),
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
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || "Failed to publish project");
        }
        return response.json();
      }),
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
      request(`${baseUrl}/marketplace/listings/${id}`).then((response) => response.json()),

    // Orders API
    getOrders: async (query: OrdersQuery = {}): Promise<OrdersResponse> => {
      const params = new URLSearchParams();
      if (query.status) params.set("status", query.status);
      if (query.page !== undefined) params.set("page", String(query.page));
      if (query.limit !== undefined) params.set("limit", String(query.limit));
      const queryStr = params.toString();
      return request(`${baseUrl}/orders${queryStr ? `?${queryStr}` : ""}`).then((response) => response.json());
    },
    getOrder: async (id: string): Promise<OrderResponse> =>
      request(`${baseUrl}/orders/${id}`).then((response) => response.json()),
    createOrder: async (input: CreateOrderInput): Promise<CreateOrderResponse> =>
      request(`${baseUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json()),
    updateOrder: async (id: string, input: UpdateOrderInput): Promise<UpdateOrderResponse> =>
      request(`${baseUrl}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json()),
    deleteOrder: async (id: string): Promise<{ ok: boolean }> =>
      request(`${baseUrl}/orders/${id}`, {
        method: "DELETE"
      }).then((response) => response.json()),
    checkPurchase: async (publishRecordId: string): Promise<CheckPurchaseResponse> =>
      request(`${baseUrl}/orders/check-purchase?publishRecordId=${encodeURIComponent(publishRecordId)}`).then((response) => response.json()),
    batchCheckPurchase: async (input: BatchCheckPurchaseInput): Promise<BatchCheckPurchaseResponse> =>
      request(`${baseUrl}/orders/batch-check-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }).then((response) => response.json()),

    // Brief and Draft APIs
    getBriefsByProjectId: async (projectId: string): Promise<BriefsResponse> =>
      request(`${baseUrl}/projects/${projectId}/briefs`).then((response) => response.json()),
    getDraftsByBriefId: async (briefId: string): Promise<DraftsResponse> =>
      request(`${baseUrl}/briefs/${briefId}/drafts`).then((response) => response.json()),

    // User wallet API
    updateUserWallet: async (walletAddress: string): Promise<{ ok: boolean; user: { id: string; walletAddress: string | null } }> =>
      request(`${baseUrl}/user/@me/wallet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update wallet address");
        }
        return response.json();
      })
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
