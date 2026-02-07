import { z } from "zod";

export const zBrandAsset = z.object({
  kind: z.enum(["logo", "product", "reference"]),
  mimeType: z.string().min(1),
  dataBase64: z.string().min(1),
  name: z.string().min(1).optional()
});

export const zGeneratedImage = z.object({
  imageDataUrl: z.string().min(1),
  aspectRatio: z.string().min(1)
});

export type BrandAsset = z.infer<typeof zBrandAsset>;
export type GeneratedImage = z.infer<typeof zGeneratedImage>;
