import { devicePresets, type DevicePresetId } from "./types"

interface DevicePresetTabsProps {
  selectedPreset: DevicePresetId
  onPresetChange: (preset: DevicePresetId) => void
}

export function DevicePresetTabs({ selectedPreset, onPresetChange }: DevicePresetTabsProps) {
  return (
    <div className="bg-card/30 border-b border-border">
      <div className="flex px-6 gap-8 overflow-x-auto">
        {devicePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPresetChange(preset.id)}
            className={`flex flex-col items-center justify-center border-b-2 py-3 transition-all shrink-0 ${
              selectedPreset === preset.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <p
              className={`text-sm ${selectedPreset === preset.id ? "font-bold tracking-tight" : "font-medium"}`}
            >
              {preset.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
