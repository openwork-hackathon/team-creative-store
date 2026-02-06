import { z } from "zod";

export const zAiCreativeAsset = z.object({
  label: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  dataUrl: z.string().min(1).optional(),
  notes: z.string().min(1).optional()
}).refine((asset) => Boolean(asset.url || asset.dataUrl), {
  message: "Asset must include either url or dataUrl.",
  path: ["url"]
});

export const zBrandAsset = z.object({
  kind: z.enum(["logo", "product", "reference"]),
  mimeType: z.string().min(1),
  dataBase64: z.string().min(1),
  name: z.string().min(1).optional()
});

export const zAiCreativeOutput = z.object({
  html: z.string().min(1),
  assets: z.array(zAiCreativeAsset).default([]),
  warnings: z.array(z.string()).optional()
});

export type AiCreativeAsset = z.infer<typeof zAiCreativeAsset>;
export type AiCreativeOutput = z.infer<typeof zAiCreativeOutput>;
export type BrandAsset = z.infer<typeof zBrandAsset>;
