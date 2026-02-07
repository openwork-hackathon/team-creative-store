import { generateText } from "ai";
import { google } from "@ai-sdk/google";
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

type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; data: string; mediaType: string };

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
  const contentParts: ContentPart[] = [{ type: "text", text: input.prompt }];

  // Add product assets as file parts for context
  for (const asset of input.productAssets ?? []) {
    contentParts.push({
      type: "file",
      data: `data:${asset.mimeType};base64,${asset.dataBase64}`,
      mediaType: asset.mimeType
    });
  }

  // Add reference assets for style/mood guidance
  for (const asset of input.referenceAssets ?? []) {
    contentParts.push({
      type: "file",
      data: `data:${asset.mimeType};base64,${asset.dataBase64}`,
      mediaType: asset.mimeType
    });
  }

  const result = await generateText({
    model: google("gemini-2.5-flash-image"),
    providerOptions: {
      google: {
        responseModalities: ["TEXT", "IMAGE"],
        ...(input.aspectRatio && {
          imageConfig: {
            aspectRatio: input.aspectRatio
          }
        })
      }
    },
    messages: [
      {
        role: "user",
        content: contentParts
      }
    ]
  });

  console.log("[AI] generateBaseImage result.text:", result.text?.substring(0, 100));
  console.log("[AI] generateBaseImage result.files:", result.files);

  return extractImageFromResult(result.files, result.text);
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

  // Extract base64 from data URL
  const baseImageBase64 = input.baseImageDataUrl.replace(/^data:[^;]+;base64,/, "");
  const baseImageMimeType = input.baseImageDataUrl.match(/^data:([^;]+);/)?.[1] ?? "image/png";

  const contentParts: ContentPart[] = [
    { type: "text", text: prompt },
    {
      type: "file",
      data: `data:${baseImageMimeType};base64,${baseImageBase64}`,
      mediaType: baseImageMimeType
    },
    {
      type: "file",
      data: `data:${input.logoAsset.mimeType};base64,${input.logoAsset.dataBase64}`,
      mediaType: input.logoAsset.mimeType
    }
  ];

  const result = await generateText({
    model: google("gemini-2.0-flash-exp"),
    providerOptions: {
      google: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    },
    messages: [
      {
        role: "user",
        content: contentParts
      }
    ]
  });

  console.log("[AI] overlayLogo result.text:", result.text?.substring(0, 100));
  console.log("[AI] overlayLogo result.files:", result.files);

  return extractImageFromResult(result.files, result.text);
}

// ============================================================================
// Shared Image Extraction
// ============================================================================

function extractImageFromResult(
  files: Array<{ mediaType: string; base64: string }> | undefined,
  text: string | undefined
): string {
  if (!files || files.length === 0) {
    throw new AiCreativeError(
      "Image generation response did not contain any files. Text: " + text?.substring(0, 200),
      "NO_FILES_IN_RESPONSE"
    );
  }

  for (const file of files) {
    console.log("[AI] File:", file);

    // Check both base64 and base64Data properties
    const base64 = (file as any).base64 || (file as any).base64Data;
    const mediaType = (file as any).mediaType || (file as any).mimeType || "image/png";

    if (base64) {
      console.log("[AI] Found image with mediaType:", mediaType);
      if (base64.startsWith("data:")) {
        return base64;
      }
      return `data:${mediaType};base64,${base64}`;
    }
  }

  throw new AiCreativeError(
    "Image generation did not return an image file in files array",
    "NO_IMAGE_GENERATED"
  );
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
  imageDataUrl: string;
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
