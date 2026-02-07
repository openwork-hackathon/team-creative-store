import { useState } from "react";
import type { PlacementSpec, PlacementSpecKey } from "../../../../shared/src/placementSpecs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExportFormat = "png" | "jpg" | "webp";

type ExportOptions = {
  format: ExportFormat;
  quality: number;
  scale: number;
  backgroundColor: string | null;
};

type ExportPanelProps = {
  selectedSpecs: PlacementSpec[];
  isExporting: boolean;
  exportProgress: number;
  onExport: (options: ExportOptions) => void;
  onCancel: () => void;
  className?: string;
};

const FORMAT_OPTIONS: { value: ExportFormat; label: string; ext: string }[] = [
  { value: "png", label: "PNG", ext: ".png" },
  { value: "jpg", label: "JPEG", ext: ".jpg" },
  { value: "webp", label: "WebP", ext: ".webp" },
];

const SCALE_OPTIONS = [
  { value: 1, label: "1x (原生)" },
  { value: 2, label: "2x (高清)" },
  { value: 3, label: "3x (超高清)" },
];

export function ExportPanel({
  selectedSpecs,
  isExporting,
  exportProgress,
  onExport,
  onCancel,
  className,
}: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [scale, setScale] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState<"#ffffff" | "transparent" | "#000000">("#ffffff");

  const handleExport = () => {
    onExport({
      format,
      quality: 0.95,
      scale,
      backgroundColor,
    });
  };

  if (isExporting) {
    return (
      <div className={cn("bg-slate-800/95 backdrop-blur rounded-xl p-6", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">导出中...</h3>
            <span className="text-sm text-slate-400">
              {exportProgress}/{selectedSpecs.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(exportProgress / selectedSpecs.length) * 100}%`,
              }}
            />
          </div>

          {/* Current Spec */}
          <p className="text-sm text-slate-400">
            正在导出: {selectedSpecs[exportProgress - 1]?.label || "完成"}
          </p>

          <Button variant="secondary" onClick={onCancel} className="w-full">
            取消导出
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-slate-800/95 backdrop-blur rounded-xl p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">导出预览</h3>
          <span className="text-sm text-slate-400">
            {selectedSpecs.length} 个尺寸
          </span>
        </div>

        {/* Specs List */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">将导出:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSpecs.map((spec) => (
              <span
                key={spec.key}
                className="px-3 py-1 bg-slate-700 rounded-full text-xs"
              >
                {spec.shortLabel} ({spec.width}×{spec.height})
              </span>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">格式</label>
          <div className="flex gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormat(opt.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  format === opt.value
                    ? "bg-primary text-white"
                    : "bg-slate-700 hover:bg-slate-600"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scale Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">清晰度</label>
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg text-sm"
          >
            {SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Background */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">背景</label>
          <div className="flex gap-2">
            <button
              onClick={() => setBackgroundColor("#ffffff")}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all",
                backgroundColor === "#ffffff"
                  ? "border-primary"
                  : "border-transparent"
              )}
              style={{ backgroundColor: "#ffffff" }}
              title="白色"
            />
            <button
              onClick={() => setBackgroundColor("transparent")}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all",
                backgroundColor === "transparent"
                  ? "border-primary"
                  : "border-transparent"
              )}
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
              }}
              title="透明"
            />
            <button
              onClick={() => setBackgroundColor("#000000")}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all",
                backgroundColor === "#000000"
                  ? "border-primary"
                  : "border-transparent"
              )}
              style={{ backgroundColor: "#000000" }}
              title="黑色"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            取消
          </Button>
          <Button variant="primary" onClick={handleExport} className="flex-1">
            <span className="material-symbols-outlined">download</span>
            导出全部
          </Button>
        </div>
      </div>
    </div>
  );
}
