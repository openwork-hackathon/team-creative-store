import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
  PLACEMENT_SPEC_BY_KEY,
  zAiCreativeOutput,
  zBrief,
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
};

export async function generateCreativeWithAi(input: CreativeGenerateInput) {
  const spec = PLACEMENT_SPEC_BY_KEY[input.placement];
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

    const sanitizedHtml = sanitizeCreativeHtml(result.object.html);
    return {
      ...result.object,
      html: sanitizedHtml
    };
  } catch {
    const fallback = buildCreativeFallback(input.placement, input.intentText);
    return {
      ...fallback,
      html: sanitizeCreativeHtml(fallback.html)
    };
  }
}
