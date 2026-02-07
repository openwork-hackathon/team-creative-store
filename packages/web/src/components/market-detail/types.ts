// Device category type
export type DeviceCategory = "mobile" | "tablet" | "desktop"

// Ad type category for better organization
export type AdType = "banner" | "rectangle" | "interstitial" | "sidebar" | "leaderboard"

// Dimension option type for ad creative sizes
export interface DimensionOption {
  width: number
  height: number
  ratio: string
  label: string
  device: DeviceCategory
  adType?: AdType
}

// Device option for sidebar selection
export interface DeviceOption {
  id: DeviceCategory
  label: string
  icon: string
  count: number
}

// Common ad creative dimensions organized by device
export const dimensionOptions: DimensionOption[] = [
  // ========== Mobile Sizes ==========
  // Banner (横幅)
  { width: 320, height: 50, ratio: "6.4:1", label: "Mobile Banner", device: "mobile", adType: "banner" },
  { width: 320, height: 100, ratio: "3.2:1", label: "Large Mobile Banner", device: "mobile", adType: "banner" },
  { width: 300, height: 50, ratio: "6:1", label: "Small Banner", device: "mobile", adType: "banner" },
  // Medium Rectangle (信息流矩形)
  { width: 300, height: 250, ratio: "6:5", label: "Medium Rectangle", device: "mobile", adType: "rectangle" },
  // Interstitial (插屏/全屏)
  { width: 320, height: 480, ratio: "2:3", label: "Interstitial Classic", device: "mobile", adType: "interstitial" },
  { width: 360, height: 640, ratio: "9:16", label: "Interstitial Android", device: "mobile", adType: "interstitial" },
  { width: 375, height: 667, ratio: "9:16", label: "Interstitial iPhone", device: "mobile", adType: "interstitial" },
  { width: 414, height: 736, ratio: "9:16", label: "Interstitial iPhone Plus", device: "mobile", adType: "interstitial" },

  // ========== Tablet Sizes ==========
  // Banner
  { width: 728, height: 90, ratio: "8.1:1", label: "Tablet Leaderboard", device: "tablet", adType: "banner" },
  { width: 468, height: 60, ratio: "7.8:1", label: "Classic Banner", device: "tablet", adType: "banner" },
  // Rectangle
  { width: 300, height: 250, ratio: "6:5", label: "Medium Rectangle", device: "tablet", adType: "rectangle" },
  { width: 336, height: 280, ratio: "6:5", label: "Large Rectangle", device: "tablet", adType: "rectangle" },
  // Interstitial
  { width: 768, height: 1024, ratio: "3:4", label: "iPad Portrait", device: "tablet", adType: "interstitial" },
  { width: 1024, height: 768, ratio: "4:3", label: "iPad Landscape", device: "tablet", adType: "interstitial" },

  // ========== Desktop Sizes ==========
  // Leaderboard (顶部横幅)
  { width: 728, height: 90, ratio: "8.1:1", label: "Leaderboard", device: "desktop", adType: "leaderboard" },
  { width: 970, height: 90, ratio: "10.8:1", label: "Large Leaderboard", device: "desktop", adType: "leaderboard" },
  { width: 970, height: 250, ratio: "3.9:1", label: "Billboard", device: "desktop", adType: "leaderboard" },
  // Medium Rectangle (信息流/侧边)
  { width: 300, height: 250, ratio: "6:5", label: "Medium Rectangle", device: "desktop", adType: "rectangle" },
  { width: 336, height: 280, ratio: "6:5", label: "Large Rectangle", device: "desktop", adType: "rectangle" },
  // Sidebar (侧栏竖条)
  { width: 160, height: 600, ratio: "4:15", label: "Wide Skyscraper", device: "desktop", adType: "sidebar" },
  { width: 300, height: 600, ratio: "1:2", label: "Half Page", device: "desktop", adType: "sidebar" },
  { width: 300, height: 1050, ratio: "2:7", label: "Portrait", device: "desktop", adType: "sidebar" },
  // Small Banner
  { width: 468, height: 60, ratio: "7.8:1", label: "Full Banner", device: "desktop", adType: "banner" },
  { width: 234, height: 60, ratio: "3.9:1", label: "Half Banner", device: "desktop", adType: "banner" },
]

// Device options for selection (count is calculated dynamically)
export const deviceOptions: DeviceOption[] = [
  { id: "mobile", label: "Mobile", icon: "smartphone", count: dimensionOptions.filter(d => d.device === "mobile").length },
  { id: "tablet", label: "Tablet", icon: "tablet_android", count: dimensionOptions.filter(d => d.device === "tablet").length },
  { id: "desktop", label: "Desktop", icon: "desktop_windows", count: dimensionOptions.filter(d => d.device === "desktop").length },
]

// Get dimensions by device category
export function getDimensionsByDevice(device: DeviceCategory): DimensionOption[] {
  return dimensionOptions.filter((d) => d.device === device)
}

// Re-export MarketplaceListing from api as MarketListing for backward compatibility
export type { MarketplaceListing as MarketListing } from "@/lib/api"
