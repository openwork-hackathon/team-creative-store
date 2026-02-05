import type { PlacementSpecKey, AiCreativeOutput } from "@creative-store/shared";

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
    listProjects: async () =>
      request(`${baseUrl}/projects`).then((response) => response.json()),
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
      }).then((response) => response.json())
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
