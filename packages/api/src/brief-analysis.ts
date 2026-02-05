import type { PlacementSpecKey } from "@creative-store/shared";

type BriefInput = {
  intentText: string;
  industry?: string;
  placements: PlacementSpecKey[];
  sensitiveWords?: string[];
};

function extractMatch(intentText: string, pattern: RegExp) {
  const match = intentText.match(pattern);
  return match?.[1]?.trim();
}

export function buildBriefJsonFromInput(input: BriefInput) {
  const targetAudience = extractMatch(
    input.intentText,
    /targeting\s+([^.,]+?)(?:\s+with|$)/i
  );
  const benefit = extractMatch(
    input.intentText,
    /for\s+([^.,]+?)(?:\s+targeting|\s+with|$)/i
  );

  return {
    industry: input.industry,
    placements: input.placements,
    audience: targetAudience ? { interests: [targetAudience] } : undefined,
    keyBenefits: benefit ? [benefit] : [],
    compliance: { sensitiveWords: input.sensitiveWords ?? [] },
    proposedHook: input.intentText
  };
}
