import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  PLACEMENT_SPEC_BY_KEY,
  zAiCreativeOutput,
  zBrief,
  type BrandAsset,
  type PlacementSpecKey
} from "@creative-store/shared";
import { sanitizeCreativeHtml } from "./creative-sanitizer";

export class AiCreativeError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AiCreativeError";
  }
}

type BriefParseInput = {
  intentText: string;
  industry?: string;
  placements: PlacementSpecKey[];
  sensitiveWords?: string[];
};

const model = () => google("gemini-3-flash-preview");

type GeminiImageInput = {
  prompt: string;
  brandAssets?: BrandAsset[];
};

export async function generateImageWithGeminiFlash(input: GeminiImageInput): Promise<string> {
  // Build message content with text prompt and brand assets as file parts
  const contentParts: Array<
    | { type: "text"; text: string }
    | { type: "file"; data: string; mediaType: string }
  > = [{ type: "text", text: input.prompt }];

  // Add brand assets as file parts (base64 data)
  for (const asset of input.brandAssets ?? []) {
    contentParts.push({
      type: "file",
      data: `data:${asset.mimeType};base64,${asset.dataBase64}`,
      mediaType: asset.mimeType
    });
  }

  const result = await generateText({
    model: google("gemini-2.5-flash-image"),
    messages: [
      {
        role: "user",
        content: contentParts
      }
    ]
  });

  console.log("[AI] generateText result.text:", result.text?.substring(0, 100));
  console.log("[AI] generateText result.files:", result.files);

  // Extract generated image from result.files
  if (!result.files || result.files.length === 0) {
    throw new AiCreativeError(
      "Image generation response did not contain any files. Text: " + result.text?.substring(0, 200),
      "NO_FILES_IN_RESPONSE"
    );
  }

  // Look for image in files
  for (const file of result.files) {
    console.log("[AI] File:", file);
    
    // Check both base64 and base64Data properties
    const base64 = (file as any).base64 || (file as any).base64Data;
    const mediaType = (file as any).mediaType || (file as any).mimeType || "image/png";
    
    if (base64) {
      console.log("[AI] Found image with mediaType:", mediaType);
      // Return as data URL (base64Data is already a full data URL from Gemini)
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

export async function parseBriefWithAi(input: BriefParseInput) {
  console.log("[AI] parseBriefWithAi called with:", input);
  const result = await generateObject({
    model: model(),
    schema: zBrief,
    prompt: [
      "Extract a structured advertising brief from the input text.",
      "Return JSON that matches the schema (industry, audience, keyBenefits, cta, style, channels, placements, compliance, proposedHook).",
      "Keep it concise and marketing-focused."
    ].join(" "),
    input: JSON.stringify(input)
  });
  console.log("[AI] parseBriefWithAi result:", result.object);

  const briefJson = {
    ...result.object,
    industry: input.industry ?? result.object.industry,
    placements: input.placements,
    compliance: {
      sensitiveWords: input.sensitiveWords ?? result.object.compliance?.sensitiveWords ?? [],
      notes: result.object.compliance?.notes
    },
    proposedHook: result.object.proposedHook ?? input.intentText
  };

  return { briefJson, warnings: [] as string[], source: "ai" as const };
}

type CreativeGenerateInput = {
  placement: PlacementSpecKey;
  brief: unknown;
  intentText?: string;
  brandAssets?: BrandAsset[];
};

const buildImagePrompt = (input: CreativeGenerateInput) => {
  const spec = PLACEMENT_SPEC_BY_KEY[input.placement];
  const intentText = input.intentText?.trim();
  return [
    "Create a high-quality, brand-safe background image for an advertisement.",
    `Placement size: ${spec.width}x${spec.height}.`,
    intentText ? `Campaign intent: ${intentText}.` : "Use a versatile, modern marketing aesthetic.",
    "Avoid adding text or logos unless provided via brand assets.",
    `Brief: ${JSON.stringify(input.brief)}`
  ].join(" ");
};

const ensureBackgroundImage = (
  html: string,
  src: string,
  assetId: string
) => {
  if (new RegExp(`data-asset-id=[\"']${assetId}[\"']`).test(html)) {
    return html;
  }

  const background = `
    <div style="position:relative;width:100%;height:100%;">
      <img data-asset-id="${assetId}" src="${src}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" />
      <div style="position:relative;z-index:1;width:100%;height:100%;">${html}</div>
    </div>
  `;

  return background;
};

export async function generateCreativeWithAi(input: CreativeGenerateInput) {
  console.log("[AI] generateCreativeWithAi called with:", input);
  const spec = PLACEMENT_SPEC_BY_KEY[input.placement];
  const imagePrompt = buildImagePrompt(input);
  console.log("[AI] Image prompt:", imagePrompt);
  const generatedImage = await generateImageWithGeminiFlash({
    prompt: imagePrompt,
    brandAssets: input.brandAssets
  });
  console.log("[AI] Generated image received");

  const result = await generateObject({
    model: model(),
    schema: zAiCreativeOutput,
    prompt: [
      "You are generating HTML for an ad creative.",
      "Return JSON with keys: html, assets, warnings.",
      "HTML must be self-contained, no external scripts or stylesheets, and no external asset URLs.",
      "Prefer inline styles or utility classes. Avoid <script> and <link> tags.",
      `Canvas size: ${spec.width}x${spec.height}.`,
      "Keep the layout within safe margins and ensure text legibility."
    ].join(" "),
    input: JSON.stringify({
      placement: input.placement,
      brief: input.brief,
      intentText: input.intentText
    })
  });

  const assets = [...(result.object.assets ?? [])];
  assets.push({ type: "image", label: "generated", dataUrl: generatedImage });

  const htmlWithBackground = ensureBackgroundImage(
    result.object.html,
    generatedImage,
    "background"
  );
  const sanitizedHtml = sanitizeCreativeHtml(htmlWithBackground);
  return {
    ...result.object,
    html: sanitizedHtml,
    assets
  };
}
