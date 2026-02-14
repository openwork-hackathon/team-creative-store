import {
  PLACEMENT_SPEC_BY_KEY,
  type BrandAsset,
  type Brief,
  type PlacementSpecKey
} from "@creative-store/shared";

export class AiCreativeError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AiCreativeError";
  }
}

// ============================================================================
// Aspect Ratio Mapping
// ============================================================================

const ASPECT_RATIO_MAP: Record<PlacementSpecKey, string> = {
  square_1_1: "1:1",
  feed_4_5: "4:5",
  story_9_16: "9:16",
  landscape_16_9: "16:9",
  banner_ultrawide: "21:9",
  tv_4k: "16:9"
};

function placementToAspectRatio(placement: PlacementSpecKey): string {
  return ASPECT_RATIO_MAP[placement] ?? "1:1";
}

// ============================================================================
// Asset Grouping
// ============================================================================

type GroupedAssets = {
  logos: BrandAsset[];
  products: BrandAsset[];
  references: BrandAsset[];
};

function groupAssetsByKind(assets: BrandAsset[]): GroupedAssets {
  const grouped: GroupedAssets = {
    logos: [],
    products: [],
    references: []
  };

  for (const asset of assets) {
    switch (asset.kind) {
      case "logo":
        grouped.logos.push(asset);
        break;
      case "product":
        grouped.products.push(asset);
        break;
      case "reference":
        grouped.references.push(asset);
        break;
    }
  }

  return grouped;
}

// ============================================================================
// Image Generation Types
// ============================================================================

type DuomiImageGenerateInput = {
  prompt: string;
  aspectRatio?: string;
  files?: Array<{ dataUrl: string; mimeType: string }>;
};

const DUOMI_CREATE_URL = "https://duomiapi.com/api/gemini/nano-banana";
const DUOMI_QUERY_URL = "https://duomiapi.com/api/gemini/nano-banana";
const DUOMI_EDIT_URL = "https://duomiapi.com/api/gemini/nano-banana-edit";
const DUOMI_POLL_MAX_ATTEMPTS = 30;
const DUOMI_POLL_INTERVAL_MS = 2_000;

function getDuomiApiKey(): string {
  const key = process.env.DUOMI_API_KEY?.trim();
  if (!key) {
    throw new AiCreativeError("DUOMI_API_KEY is not configured", "MISSING_API_KEY");
  }
  return key;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getValueAtPath(obj: unknown, path: string[]): unknown {
  let cursor = obj;
  for (const segment of path) {
    if (!cursor || typeof cursor !== "object" || !(segment in cursor)) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

function pickString(obj: unknown, paths: string[][]): string | undefined {
  for (const path of paths) {
    const value = getValueAtPath(obj, path);
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function normalizeAspectRatio(aspectRatio?: string): string {
  return aspectRatio?.trim() || "1:1";
}

function toDuomiFiles(files?: Array<{ dataUrl: string; mimeType: string }>): Array<{ data: string; media_type: string }> {
  return (files ?? []).map((file) => ({
    data: file.dataUrl,
    media_type: file.mimeType
  }));
}

function buildDuomiGenerateBody(input: DuomiImageGenerateInput): Record<string, unknown> {
  const images = toDuomiFiles(input.files);
  return {
    model: "gemini-2.5-pro-image-preview",
    prompt: input.prompt,
    aspect_ratio: normalizeAspectRatio(input.aspectRatio),
    image_size: "1K",
    ...(images.length > 0 && {
      image_urls: images.map(img => img.data)
    })
  };
}

function extractTaskId(payload: unknown): string | undefined {
  return pickString(payload, [
    ["data", "task_id"],
    ["taskId"],
    ["task_id"],
    ["id"],
    ["data", "taskId"],
    ["data", "id"]
  ]);
}

function extractStatus(payload: unknown): string | undefined {
  return pickString(payload, [
    ["data", "state"],
    ["status"],
    ["state"],
    ["data", "status"]
  ])?.toLowerCase();
}

type ExtractedImage = {
  imageBase64?: string;
  imageUrl?: string;
  mimeType?: string;
};

function extractImage(payload: unknown): ExtractedImage {
  const imageBase64 = pickString(payload, [
    ["imageBase64"],
    ["image_base64"],
    ["base64"],
    ["data", "imageBase64"],
    ["data", "image_base64"],
    ["data", "base64"],
    ["data", "image", "base64"],
    ["output", "imageBase64"],
    ["output", "base64"]
  ]);

  const imageUrl = pickString(payload, [
    ["imageUrl"],
    ["image_url"],
    ["url"],
    ["data", "imageUrl"],
    ["data", "image_url"],
    ["data", "url"],
    ["output", "imageUrl"],
    ["output", "url"]
  ]);

  const mimeType = pickString(payload, [
    ["mimeType"],
    ["mime_type"],
    ["data", "mimeType"],
    ["data", "mime_type"]
  ]);

  if (imageBase64 || imageUrl) {
    return { imageBase64, imageUrl, mimeType };
  }

  // Handle Nano Banana nested images array: { data: { state: "succeeded", data: { images: [{url, file_name}] } } }
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const nestedData = (data as { data?: unknown }).data;
      if (nestedData && typeof nestedData === "object") {
        const images = (nestedData as { images?: unknown[] }).images;
        if (Array.isArray(images) && images.length > 0) {
          const first = images[0];
          if (first && typeof first === "object") {
            const img = first as Record<string, unknown>;
            return {
              imageUrl: typeof img.url === "string" ? img.url : undefined,
              imageBase64: typeof img.base64 === "string" ? img.base64 : undefined,
              mimeType: "image/png"
            };
          }
        }
      }
    }
  }

  // Handle OpenAI-style array format: { data: [{ url, b64_json }] }
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      if (first && typeof first === "object") {
        const firstRecord = first as Record<string, unknown>;
        const url = typeof firstRecord.url === "string" ? firstRecord.url : undefined;
        const b64 =
          typeof firstRecord.b64_json === "string"
            ? firstRecord.b64_json
            : typeof firstRecord.base64 === "string"
              ? firstRecord.base64
              : undefined;
        return {
          imageBase64: b64,
          imageUrl: url,
          mimeType
        };
      }
    }
  }

  return { imageBase64, imageUrl, mimeType };
}

async function fetchJson(url: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(url, init);
  const text = await response.text();

  if (!response.ok) {
    throw new AiCreativeError(
      `Duomi request failed (${response.status}): ${text.substring(0, 300)}`,
      "DUOMI_HTTP_ERROR"
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new AiCreativeError(
      `Duomi returned non-JSON response: ${text.substring(0, 300)}`,
      "DUOMI_INVALID_RESPONSE"
    );
  }
}

async function fetchImageAsDataUrl(imageUrl: string, fallbackMimeType = "image/png"): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new AiCreativeError(
      `Failed to fetch generated image URL (${response.status})`,
      "DUOMI_IMAGE_FETCH_ERROR"
    );
  }

  const contentType = response.headers.get("content-type") || fallbackMimeType;
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${imageBuffer.toString("base64")}`;
}

function toDataUrl(image: ExtractedImage): string | undefined {
  if (image.imageBase64) {
    if (image.imageBase64.startsWith("data:")) {
      return image.imageBase64;
    }
    return `data:${image.mimeType ?? "image/png"};base64,${image.imageBase64}`;
  }
  return undefined;
}

async function pollForDuomiImage(apiKey: string, taskId: string): Promise<unknown> {
  for (let attempt = 0; attempt < DUOMI_POLL_MAX_ATTEMPTS; attempt++) {
    const payload = await fetchJson(`${DUOMI_QUERY_URL}/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: apiKey
      }
    });

    const status = extractStatus(payload);
    const image = extractImage(payload);
    if (image.imageBase64 || image.imageUrl) {
      return payload;
    }

    if (status && ["failed", "error", "cancelled"].includes(status)) {
      throw new AiCreativeError(`Duomi task ${taskId} failed with status: ${status}`, "DUOMI_TASK_FAILED");
    }

    await sleep(DUOMI_POLL_INTERVAL_MS);
  }

  throw new AiCreativeError(
    `Duomi task did not complete in time: ${taskId}`,
    "DUOMI_TASK_TIMEOUT"
  );
}

async function generateImageWithDuomi(input: DuomiImageGenerateInput): Promise<string> {
  const apiKey = getDuomiApiKey();

  const payload = await fetchJson(DUOMI_CREATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey
    },
    body: JSON.stringify(buildDuomiGenerateBody(input))
  });

  const immediateImage = extractImage(payload);
  const immediateDataUrl = toDataUrl(immediateImage);
  if (immediateDataUrl) {
    return immediateDataUrl;
  }

  if (immediateImage.imageUrl) {
    return fetchImageAsDataUrl(immediateImage.imageUrl, immediateImage.mimeType);
  }

  const taskId = extractTaskId(payload);
  if (!taskId) {
    throw new AiCreativeError(
      "Duomi response did not contain an image or task id",
      "DUOMI_NO_TASK_ID"
    );
  }

  const completedPayload = await pollForDuomiImage(apiKey, taskId);
  const completedImage = extractImage(completedPayload);
  const completedDataUrl = toDataUrl(completedImage);
  if (completedDataUrl) {
    return completedDataUrl;
  }

  if (completedImage.imageUrl) {
    return fetchImageAsDataUrl(completedImage.imageUrl, completedImage.mimeType);
  }

  throw new AiCreativeError(
    "Duomi task completed without image data",
    "DUOMI_NO_IMAGE"
  );
}

function toDuomiFileFromBrandAsset(asset: BrandAsset): { dataUrl: string; mimeType: string } {
  return {
    dataUrl: `data:${asset.mimeType};base64,${asset.dataBase64}`,
    mimeType: asset.mimeType
  };
}

function parseDataUrl(dataUrl: string): { mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new AiCreativeError("Invalid data URL returned from image generation", "INVALID_DATA_URL");
  }

  return {
    mimeType: match[1]
  };
}

// ============================================================================
// Base Image Generation (Flash model)
// ============================================================================

type GenerateImageInput = {
  prompt: string;
  aspectRatio?: string;
  productAssets?: BrandAsset[];
  referenceAssets?: BrandAsset[];
};

async function generateBaseImage(input: GenerateImageInput): Promise<string> {
  const files = [...(input.productAssets ?? []), ...(input.referenceAssets ?? [])].map(
    toDuomiFileFromBrandAsset
  );

  return generateImageWithDuomi({
    prompt: input.prompt,
    aspectRatio: input.aspectRatio,
    files
  });
}

// ============================================================================
// Logo Overlay (Flash exp model for compositing)
// ============================================================================

type LogoOverlayInput = {
  baseImageDataUrl: string;
  logoAsset: BrandAsset;
};

async function overlayLogo(input: LogoOverlayInput): Promise<string> {
  const prompt = [
    "Add the logo from the second image onto a natural, appropriate surface in the first image",
    "(such as a corner badge, sign, device, or packaging).",
    "Preserve all original details including any text in the image.",
    "Match lighting, perspective, and texture so the logo appears naturally integrated.",
    "Position the logo in a prominent but non-intrusive location.",
    "Do not alter faces, key features, or existing text."
  ].join(" ");

  const apiKey = getDuomiApiKey();

  // Use edit endpoint for logo overlay
  const payload = await fetchJson(DUOMI_EDIT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey
    },
    body: JSON.stringify({
      model: "gemini-2.5-pro-image-preview",
      prompt,
      image_urls: [
        input.baseImageDataUrl,
        `data:${input.logoAsset.mimeType};base64,${input.logoAsset.dataBase64}`
      ],
      image_size: "1K"
    })
  });

  // Check for immediate image
  const immediateImage = extractImage(payload);
  const immediateDataUrl = toDataUrl(immediateImage);
  if (immediateDataUrl) {
    return immediateDataUrl;
  }

  if (immediateImage.imageUrl) {
    return fetchImageAsDataUrl(immediateImage.imageUrl, immediateImage.mimeType);
  }

  // Extract task_id and poll for completion
  const taskId = extractTaskId(payload);
  if (!taskId) {
    throw new AiCreativeError("Duomi edit returned no task_id", "DUOMI_NO_TASK_ID");
  }

  const completedPayload = await pollForDuomiImage(apiKey, taskId);
  const completedImage = extractImage(completedPayload);
  const completedDataUrl = toDataUrl(completedImage);

  if (completedDataUrl) {
    return completedDataUrl;
  }

  if (completedImage.imageUrl) {
    return fetchImageAsDataUrl(completedImage.imageUrl, completedImage.mimeType);
  }

  throw new AiCreativeError("Logo overlay failed to return image", "DUOMI_NO_IMAGE");
}

// ============================================================================
// Prompt Building
// ============================================================================

type ImageGenerateInput = {
  placement: PlacementSpecKey;
  brief: unknown;
  intentText?: string;
  brandAssets?: BrandAsset[];
};

function buildImagePrompt(input: ImageGenerateInput, aspectRatio: string): string {
  const spec = PLACEMENT_SPEC_BY_KEY[input.placement];
  const brief = input.brief as Brief | undefined;
  const intentText = input.intentText?.trim();
  const hook = brief?.proposedHook?.trim();

  const promptParts: string[] = [
    "Create a high-quality advertisement image."
  ];

  // Aspect ratio instruction
  promptParts.push(`Generate the image at ${aspectRatio} aspect ratio (${spec.width}x${spec.height} pixels).`);

  // Hook text - render the proposed hook in the image
  if (hook) {
    promptParts.push(
      `IMPORTANT: Include this advertising text prominently and legibly in the image: "${hook}".`,
      "The text should be styled to match the overall design aesthetic,",
      "placed in a visually balanced position, and ensure high contrast for readability."
    );
  }

  // Campaign intent
  if (intentText) {
    promptParts.push(`Campaign intent: ${intentText}.`);
  } else {
    promptParts.push("Use a versatile, modern marketing aesthetic.");
  }

  // Style guidance from brief
  if (brief?.style?.tone) {
    promptParts.push(`Tone: ${brief.style.tone}.`);
  }
  if (brief?.style?.keywords && brief.style.keywords.length > 0) {
    promptParts.push(`Style keywords: ${brief.style.keywords.join(", ")}.`);
  }

  // Product/reference image instructions
  promptParts.push(
    "If product images are provided, incorporate them naturally into the composition.",
    "If reference images are provided, use them as style and mood inspiration."
  );

  // Brief context
  promptParts.push(`Brief context: ${JSON.stringify(input.brief)}`);

  return promptParts.join(" ");
}

// ============================================================================
// Main Image Generation
// ============================================================================

export type GenerateCreativeImageInput = {
  placement: PlacementSpecKey;
  brief: unknown;
  intentText?: string;
  brandAssets?: BrandAsset[];
};

export type GenerateCreativeImageResult = {
  imageDataUrl: string; // Base64 data URL (internal use, will be uploaded to S3)
  aspectRatio: string;
};

export async function generateCreativeImage(input: GenerateCreativeImageInput): Promise<GenerateCreativeImageResult> {
  console.log("[AI] generateCreativeImage called with:", input);

  const aspectRatio = placementToAspectRatio(input.placement);

  // Group brand assets by kind
  const { logos, products, references } = groupAssetsByKind(input.brandAssets ?? []);
  console.log("[AI] Grouped assets - logos:", logos.length, "products:", products.length, "references:", references.length);

  // Phase 1: Generate base image with products, references, and hook text
  const imagePrompt = buildImagePrompt(input, aspectRatio);
  console.log("[AI] Image prompt:", imagePrompt);

  let imageDataUrl = await generateBaseImage({
    prompt: imagePrompt,
    aspectRatio,
    productAssets: products,
    referenceAssets: references
  });
  console.log("[AI] Base image generated");

  // Phase 2: Overlay logo if provided
  if (logos.length > 0) {
    console.log("[AI] Overlaying logo onto base image");
    imageDataUrl = await overlayLogo({
      baseImageDataUrl: imageDataUrl,
      logoAsset: logos[0] // Use first logo
    });
    console.log("[AI] Logo overlay complete");
  }

  return {
    imageDataUrl,
    aspectRatio
  };
}
