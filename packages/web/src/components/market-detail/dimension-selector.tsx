import { dimensionOptions } from "./types"

interface DimensionSelectorProps {
  selectedIndex: number
  onDimensionChange: (index: number) => void
}

export function DimensionSelector({ selectedIndex, onDimensionChange }: DimensionSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Dimensions
        </h3>
      </div>
      <div className="flex flex-col gap-1">
        {dimensionOptions.map((dim, index) => (
          <button
            key={`${dim.width}x${dim.height}`}
            type="button"
            onClick={() => onDimensionChange(index)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              selectedIndex === index
                ? "bg-muted border border-border"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <p
              className={`text-xs font-mono ${selectedIndex === index ? "text-foreground uppercase" : ""}`}
            >
              {dim.width} x {dim.height}
            </p>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                selectedIndex === index ? "bg-primary/20 text-primary font-bold" : ""
              }`}
            >
              {dim.ratio}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
