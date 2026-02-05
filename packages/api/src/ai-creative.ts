import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
  PLACEMENT_SPEC_BY_KEY,
  zAiCreativeOutput,
  zBrief,
  type BrandAsset,
  type PlacementSpecKey
} from "@creative-store/shared";
import { buildBriefJsonFromInput } from "./brief-analysis";
import { sanitizeCreativeHtml } from "./creative-sanitizer";

type BriefParseInput = {
  intentText: string;
  industry?: string;
  placements: PlacementSpecKey[];
  sensitiveWords?: string[];
};

const model = () => google("gemini-1.5-flash");
const PLACEHOLDER_IMAGE_DATA_URL =
  "data:image/svg+xml;base64," +
  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiB2aWV3Qm94PSIwIDAgODAwIDgwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiNFNkUwRDYiLz48cGF0aCBkPSJNMCA2MDBMMjAwIDQwMGwyMDAgMjAwIDIwMC0xNTAgMjAwIDI1MFY4MDBIMHoiIGZpbGw9IiNDQ0M0QjgiIG9wYWNpdHk9Ii44Ii8+PHRleHQgeD0iNDAwIiB5PSIzODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMyIiBmaWxsPSIjNjY2Ij5QbGFjZWhvbGRlciBJbWFnZTwvdGV4dD48L3N2Zz4=";

type GeminiImageInput = {
  prompt: string;
  brandAssets?: BrandAsset[];
};

export async function generateImageWithGeminiFlash(input: GeminiImageInput) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const inlineDataParts =
      input.brandAssets?.map((asset) => ({
        inlineData: {
          mimeType: asset.mimeType,
          data: asset.dataBase64
        }
      })) ?? [];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: input.prompt }, ...inlineDataParts]
            }
          ],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
        })
      }
    );

    if (!response.ok) return null;
    const payload = await response.json();
    const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];

    for (const candidate of candidates) {
      const parts = candidate?.content?.parts;
      if (!Array.isArray(parts)) continue;
      const imagePart = parts.find(
        (part) =>
          part?.inlineData?.mimeType?.startsWith("image/") &&
          typeof part.inlineData.data === "string" &&
          part.inlineData.data.length > 0
      );
      if (imagePart) {
        const { mimeType, data } = imagePart.inlineData;
        return `data:${mimeType};base64,${data}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function parseBriefWithAi(input: BriefParseInput) {
  try {
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
  } catch {
    const briefJson = buildBriefJsonFromInput(input);
    return {
      briefJson,
      warnings: ["AI brief parsing unavailable. Used heuristic fallback."],
      source: "fallback" as const
    };
  }
}

const buildCreativeFallback = (placement: PlacementSpecKey, intentText?: string) => {
  const spec = PLACEMENT_SPEC_BY_KEY[placement];
  const headline = intentText ? intentText.split(".")[0] : "Discover the latest offer";
  const html = `
    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f7f2ea;">
      <div style="width:90%;height:90%;border:2px solid #1b1b1b;padding:24px;display:flex;flex-direction:column;justify-content:space-between;">
        <div style="font-size:32px;font-weight:700;color:#1b1b1b;">${headline}</div>
        <div style="font-size:18px;color:#4b4b4b;">Placement ${spec.width}x${spec.height}</div>
        <button style="align-self:flex-start;background:#1b1b1b;color:#fff;padding:12px 20px;border-radius:999px;border:none;">Shop now</button>
      </div>
    </div>
  `;

  return {
    html,
    assets: [],
    warnings: ["AI creative generation unavailable. Returned fallback layout."]
  };
};

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
  const spec = PLACEMENT_SPEC_BY_KEY[input.placement];
  const imagePrompt = buildImagePrompt(input);
  const generatedImage = await generateImageWithGeminiFlash({
    prompt: imagePrompt,
    brandAssets: input.brandAssets
  });
  const backgroundSrc = generatedImage ?? PLACEHOLDER_IMAGE_DATA_URL;
  try {
    const result = await generateObject({
      model: model(),
      schema: zAiCreativeOutput,
      prompt: [
        "You are generating HTML for an ad creative.",
        "Return JSON with keys: html, assets, warnings, metadata.",
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
    if (generatedImage) {
      assets.push({ type: "image", label: "generated", dataUrl: generatedImage });
    } else {
      assets.push({ type: "image", label: "placeholder", url: backgroundSrc });
    }

    const htmlWithBackground = ensureBackgroundImage(
      result.object.html,
      backgroundSrc,
      "background"
    );
    const sanitizedHtml = sanitizeCreativeHtml(htmlWithBackground);
    return {
      ...result.object,
      html: sanitizedHtml,
      assets
    };
  } catch {
    const fallback = buildCreativeFallback(input.placement, input.intentText);
    const htmlWithBackground = ensureBackgroundImage(
      fallback.html,
      backgroundSrc,
      "background"
    );
    return {
      ...fallback,
      html: sanitizeCreativeHtml(htmlWithBackground),
      assets: [
        ...(fallback.assets ?? []),
        generatedImage
          ? { type: "image", label: "generated", dataUrl: generatedImage }
          : { type: "image", label: "placeholder", url: backgroundSrc }
      ]
    };
  }
}
