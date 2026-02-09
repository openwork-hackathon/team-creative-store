export type PlacementSpecKey =
  | "square_1_1"
  | "feed_4_5"
  | "story_9_16"
  | "landscape_16_9"
  | "banner_ultrawide"
  | "tv_4k";

export type DeviceCategory = "mobile" | "web" | "tv";

export type PlacementSpec = {
  key: PlacementSpecKey;
  label: string;
  category: DeviceCategory;
  width: number;
  height: number;
  aspectRatio: string;
  // UI fields
  icon: string;
  shortLabel: string;
  // safe-area margins in pixels
  safeArea: { top: number; right: number; bottom: number; left: number };
  rules: {
    minTitleFontSize: number;
    minBodyFontSize: number;
    maxTitleLines: number;
    maxBodyLines: number;
  };
};

// MVP fixed specs
export const PLACEMENT_SPECS: PlacementSpec[] = [
  {
    key: "square_1_1",
    label: "Square 1:1 (1080×1080)",
    category: "mobile",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    icon: "square",
    shortLabel: "1:1",
    safeArea: { top: 64, right: 64, bottom: 64, left: 64 },
    rules: { minTitleFontSize: 44, minBodyFontSize: 28, maxTitleLines: 2, maxBodyLines: 4 }
  },
  {
    key: "feed_4_5",
    label: "Feed 4:5 (1080×1350)",
    category: "mobile",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    icon: "rectangle",
    shortLabel: "4:5",
    safeArea: { top: 64, right: 64, bottom: 80, left: 64 },
    rules: { minTitleFontSize: 44, minBodyFontSize: 28, maxTitleLines: 2, maxBodyLines: 4 }
  },
  {
    key: "story_9_16",
    label: "Story 9:16 (1080×1920)",
    category: "mobile",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    icon: "phone_iphone",
    shortLabel: "9:16",
    // extra bottom safe-area for UI overlays
    safeArea: { top: 120, right: 80, bottom: 220, left: 80 },
    rules: { minTitleFontSize: 52, minBodyFontSize: 30, maxTitleLines: 3, maxBodyLines: 4 }
  },
  {
    key: "landscape_16_9",
    label: "Landscape 16:9 (1920×1080)",
    category: "web",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    icon: "desktop_windows",
    shortLabel: "16:9",
    safeArea: { top: 64, right: 96, bottom: 64, left: 96 },
    rules: { minTitleFontSize: 52, minBodyFontSize: 30, maxTitleLines: 2, maxBodyLines: 3 }
  },
  {
    key: "banner_ultrawide",
    label: "Ultrawide Banner (2560×720)",
    category: "web",
    width: 2560,
    height: 720,
    aspectRatio: "ultra",
    icon: "width_full",
    shortLabel: "ULTRA",
    safeArea: { top: 48, right: 120, bottom: 48, left: 120 },
    rules: { minTitleFontSize: 56, minBodyFontSize: 32, maxTitleLines: 1, maxBodyLines: 2 }
  },
  {
    key: "tv_4k",
    label: "TV 4K (3840×2160)",
    category: "tv",
    width: 3840,
    height: 2160,
    aspectRatio: "16:9",
    icon: "tv",
    shortLabel: "4K",
    // TV overscan-ish margins
    safeArea: { top: 160, right: 200, bottom: 160, left: 200 },
    rules: { minTitleFontSize: 96, minBodyFontSize: 56, maxTitleLines: 2, maxBodyLines: 3 }
  }
];

export const PLACEMENT_SPEC_BY_KEY = Object.fromEntries(
  PLACEMENT_SPECS.map((s) => [s.key, s] as const)
) as Record<PlacementSpecKey, PlacementSpec>;
