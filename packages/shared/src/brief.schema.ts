import { z } from "zod";
import { zPlacementSpecKey } from "./placementSpecs.schema";

export const zAudience = z.object({
  ageRange: z.string().optional(),
  geo: z.string().optional(),
  interests: z.array(z.string()).default([])
});

export const zBrief = z.object({
  industry: z.string().optional(),
  objective: z.string().optional(),
  audience: zAudience.optional(),
  keyBenefits: z.array(z.string()).default([]),
  cta: z.string().optional(),
  style: z.object({
    tone: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    references: z.array(z.string()).default([])
  }).default({ keywords: [], references: [] }),
  channels: z.array(z.string()).default([]),
  placements: z.array(zPlacementSpecKey).default([]),
  compliance: z.object({
    sensitiveWords: z.array(z.string()).default([]),
    notes: z.string().optional()
  }).default({ sensitiveWords: [] })
});

export type Brief = z.infer<typeof zBrief>;

export const zCreateBriefInput = z.object({
  intentText: z.string().min(10),
  projectId: z.string().uuid(),
  placements: z.array(zPlacementSpecKey).min(1),
  industry: z.string().optional(),
  sensitiveWords: z.array(z.string()).optional()
});

export type CreateBriefInput = z.infer<typeof zCreateBriefInput>;
