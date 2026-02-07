import { generateText, Output, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import {
  zBrief,
  type Brief,
  type PlacementSpecKey
} from "@creative-store/shared";

export class AiBriefError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AiBriefError";
  }
}

// --- Research Types ---

type ResearchSource = {
  url: string;
  title?: string;
  snippet?: string;
};

type ResearchResult = {
  summary: string;
  sources: ResearchSource[];
  stepCount: number;
  warnings: string[];
};

type BriefParseInput = {
  intentText: string;
  industry?: string;
  placements: PlacementSpecKey[];
  sensitiveWords?: string[];
};

type BriefParseResult = {
  briefJson: Brief;
  warnings: string[];
  source: "ai";
  sources: ResearchSource[];
  researchSummary: string;
  stepCount: number;
};

// --- Research Constants ---

const RESEARCH_MAX_STEPS = 8;

const RESEARCH_SYSTEM_PROMPT = `You are a marketing research agent conducting comprehensive research to create an advertising brief.

Your goal is to gather information across these dimensions:
1. **Brand/Company Research**: Company background, products, value proposition, brand voice
2. **Industry Analysis**: Market position, industry trends, key players
3. **Competitor Intelligence**: Main competitors, their positioning, differentiation
4. **Audience Insights**: Target demographics, psychographics, behaviors, pain points
5. **Compliance Context**: Industry regulations, sensitive topics, advertising restrictions

## Research Strategy
- Start with the brand/product mentioned to understand the core offering
- Search for industry context and market trends
- Look for competitor positioning and messaging strategies
- Research target audience characteristics for the industry
- Check for any compliance or regulatory considerations

## Output Format
After completing your research, provide a comprehensive summary organized by:
- Brand Overview
- Industry Context
- Competitive Landscape
- Target Audience Profile
- Compliance Considerations
- Recommended Messaging Strategy

Use multiple search queries to build a complete picture. Be thorough but focused on advertising-relevant insights.`;

const EXTRACTION_SYSTEM_PROMPT = `You are extracting a structured advertising brief from research findings.

Convert the research into a concise, actionable brief following the schema exactly.
- Be specific and marketing-focused
- Use insights from research to inform each field
- If research is inconclusive for a field, leave it empty rather than guessing
- keyBenefits should be compelling selling points
- style.keywords should be terms that resonate with the target audience
- proposedHook should be an attention-grabbing opening line`;

// --- Research Helper Functions ---

function buildResearchPrompt(input: BriefParseInput): string {
  const parts = [
    `## Campaign Intent`,
    input.intentText,
    ``,
    `## Known Context`,
  ];

  if (input.industry) {
    parts.push(`- Industry: ${input.industry}`);
  }

  if (input.placements.length > 0) {
    parts.push(`- Target placements: ${input.placements.join(", ")}`);
  }

  if (input.sensitiveWords?.length) {
    parts.push(`- Known sensitive words to avoid: ${input.sensitiveWords.join(", ")}`);
  }

  parts.push(
    ``,
    `## Research Task`,
    `Conduct comprehensive research to inform an advertising brief for this campaign.`,
    `Search for brand information, industry context, competitors, and audience insights.`,
    `Synthesize findings into actionable advertising recommendations.`
  );

  return parts.join("\n");
}

function buildExtractionPrompt(
  input: BriefParseInput,
  research: ResearchResult
): string {
  return `## Original Campaign Intent
${input.intentText}

## Research Findings
${research.summary}

## Task
Extract a structured advertising brief from the research above.
Focus on actionable, marketing-relevant information.`;
}

function extractSources(
  result: Awaited<ReturnType<typeof generateText>>
): ResearchSource[] {
  const sources: ResearchSource[] = [];

  for (const step of result.steps) {
    const metadata = step.providerMetadata?.google as Record<string, unknown> | undefined;
    const groundingMetadata = metadata?.groundingMetadata as {
      groundingChunks?: Array<{
        web?: { uri?: string; title?: string };
        retrievedContext?: { text?: string };
      }>;
    } | undefined;

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            url: chunk.web.uri,
            title: chunk.web.title,
            snippet: chunk.retrievedContext?.text?.substring(0, 200)
          });
        }
      }
    }
  }

  // Deduplicate by URL
  return [...new Map(sources.map(s => [s.url, s])).values()];
}

// --- Core Research Functions ---

async function conductResearch(input: BriefParseInput): Promise<ResearchResult> {
  const researchModel = google("gemini-2.5-flash");

  const result = await generateText({
    model: researchModel,
    tools: {
      google_search: google.tools.googleSearch({
        mode: "MODE_DYNAMIC",
        dynamicThreshold: 0.3
      })
    },
    stopWhen: stepCountIs(RESEARCH_MAX_STEPS),
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: buildResearchPrompt(input),
  });

  const sources = extractSources(result);
  const warnings: string[] = [];

  if (sources.length === 0) {
    warnings.push("No Google Search sources found during research phase.");
  }

  if (result.steps.length >= RESEARCH_MAX_STEPS) {
    warnings.push("Research reached maximum steps; results may be incomplete.");
  }

  console.log(`[AI] Research completed in ${result.steps.length} steps, found ${sources.length} sources`);

  return {
    summary: result.text,
    sources,
    stepCount: result.steps.length,
    warnings
  };
}

async function extractBrief(
  input: BriefParseInput,
  research: ResearchResult
): Promise<BriefParseResult> {
  const extractionModel = google("gemini-2.5-flash");

  const result = await generateText({
    model: extractionModel,
    output: Output.object({ schema: zBrief }),
    system: EXTRACTION_SYSTEM_PROMPT,
    prompt: buildExtractionPrompt(input, research),
  });

  const extractedBrief = result.output;

  if (!extractedBrief) {
    throw new AiBriefError(
      "Failed to extract structured brief from research",
      "BRIEF_EXTRACTION_FAILED"
    );
  }

  // Merge input overrides with AI-generated brief
  const briefJson: Brief = {
    ...extractedBrief,
    industry: input.industry ?? extractedBrief.industry,
    placements: input.placements,
    compliance: {
      sensitiveWords: input.sensitiveWords ?? extractedBrief.compliance?.sensitiveWords ?? [],
      notes: extractedBrief.compliance?.notes
    },
    proposedHook: extractedBrief.proposedHook ?? input.intentText
  };

  return {
    briefJson,
    warnings: research.warnings,
    source: "ai" as const,
    sources: research.sources,
    researchSummary: research.summary,
    stepCount: research.stepCount
  };
}

// --- Public API ---

export async function parseBriefWithAi(input: BriefParseInput): Promise<BriefParseResult> {
  console.log("[AI] parseBriefWithAi called with:", input);

  // Phase 1: Conduct comprehensive research with agentic loop
  const research = await conductResearch(input);
  console.log("[AI] Research summary:", research.summary.substring(0, 200));

  // Phase 2: Extract structured brief from research findings
  const result = await extractBrief(input, research);
  console.log("[AI] parseBriefWithAi result:", result.briefJson);

  if (result.sources.length > 0) {
    console.log("[AI] parseBriefWithAi sources:", result.sources);
  }

  return result;
}
