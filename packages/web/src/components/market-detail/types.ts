// Device options for preview
export const deviceOptions = [
  { id: "mobile", label: "Mobile Portrait", icon: "smartphone" },
  { id: "desktop", label: "Desktop Billboard", icon: "desktop_windows" },
] as const

export type DeviceOption = (typeof deviceOptions)[number]
export type DeviceId = DeviceOption["id"]

// Dimension options
export const dimensionOptions = [
  { width: 1080, height: 1920, ratio: "9:16" },
  { width: 1080, height: 1080, ratio: "1:1" },
  { width: 1280, height: 720, ratio: "16:9" },
] as const

export type DimensionOption = (typeof dimensionOptions)[number]

// Device presets for preview
export const devicePresets = [
  { id: "iphone14", label: "iPhone 14 Pro Max" },
  { id: "galaxy", label: "Galaxy Ultra S23" },
  { id: "ipad", label: 'iPad Pro (12.9")' },
] as const

export type DevicePreset = (typeof devicePresets)[number]
export type DevicePresetId = DevicePreset["id"]

// Re-export MarketplaceListing from api as MarketListing for backward compatibility
export type { MarketplaceListing as MarketListing } from "@/lib/api"
