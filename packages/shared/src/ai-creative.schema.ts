import { z } from "zod";

export const zAiCreativeAsset = z.object({
  label: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  notes: z.string().min(1).optional()
});

export const zAiCreativeOutput = z.object({
  html: z.string().min(1),
  assets: z.array(zAiCreativeAsset).default([]),
  warnings: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type AiCreativeAsset = z.infer<typeof zAiCreativeAsset>;
export type AiCreativeOutput = z.infer<typeof zAiCreativeOutput>;
