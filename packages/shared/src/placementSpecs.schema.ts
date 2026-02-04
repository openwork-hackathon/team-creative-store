import { z } from "zod";

export const zPlacementSpecKey = z.enum([
  "square_1_1",
  "feed_4_5",
  "story_9_16",
  "landscape_16_9",
  "banner_ultrawide",
  "tv_4k"
]);

export type PlacementSpecKey = z.infer<typeof zPlacementSpecKey>;
