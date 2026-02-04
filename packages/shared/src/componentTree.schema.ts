import { z } from "zod";

export const zColor = z.string(); // hex or css color

export const zBox = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive()
});

export const zTextStyle = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.number().positive(),
  fontWeight: z.number().int().optional(),
  color: zColor.optional(),
  align: z.enum(["left", "center", "right"]).default("left")
});

export const zComponentBase = z.object({
  id: z.string().min(1),
  box: zBox.optional(),
  zIndex: z.number().int().optional()
});

export const zBackground = zComponentBase.extend({
  type: z.literal("Background"),
  fill: zColor
});

export const zImage = zComponentBase.extend({
  type: z.literal("Image"),
  assetId: z.string().uuid().optional(),
  fit: z.enum(["cover", "contain"]).default("cover")
});

export const zText = zComponentBase.extend({
  type: z.literal("Text"),
  text: z.string(),
  style: zTextStyle
});

export const zButton = zComponentBase.extend({
  type: z.literal("Button"),
  text: z.string(),
  style: zTextStyle,
  background: zColor.optional(),
  radius: z.number().optional()
});

export const zLogo = zComponentBase.extend({
  type: z.literal("Logo"),
  assetId: z.string().uuid().optional(),
  fit: z.enum(["contain", "cover"]).default("contain")
});

export const zComponent = z.discriminatedUnion("type", [
  zBackground,
  zImage,
  zText,
  zButton,
  zLogo
]);

export const zComponentTree = z.object({
  canvas: z.object({ w: z.number().positive(), h: z.number().positive() }),
  components: z.array(zComponent)
});

export type ComponentTree = z.infer<typeof zComponentTree>;
