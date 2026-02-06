import { deviceOptions, type DeviceId } from "./types"

interface DeviceSelectorProps {
  selectedDevice: DeviceId
  onDeviceChange: (device: DeviceId) => void
}

export function DeviceSelector({ selectedDevice, onDeviceChange }: DeviceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Device Selection
        </h3>
        <p className="text-[11px] text-muted-foreground">Preview layouts</p>
      </div>
      <div className="flex flex-col gap-1">
        {deviceOptions.map((device) => (
          <button
            key={device.id}
            type="button"
            onClick={() => onDeviceChange(device.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              selectedDevice === device.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <span className="material-symbols-outlined">{device.icon}</span>
            <p className="text-sm font-medium">{device.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
