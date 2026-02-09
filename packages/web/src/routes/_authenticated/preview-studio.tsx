import { useState, useMemo, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PLACEMENT_SPECS, type PlacementSpecKey, type DeviceCategory } from "../../../../shared/src/placementSpecs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DeviceSizePicker,
  PreviewToolbar,
  PreviewCanvas,
  DeviceTabs,
  ExportPanel,
} from "@/components/preview";
import html2canvas from "html2canvas";

type CreativeStatus = "draft" | "published" | "purchased";
type ExportFormat = "png" | "jpg" | "webp";

type ExportOptions = {
  format: ExportFormat;
  quality: number;
  scale: number;
  backgroundColor: string | null;
};

function PreviewStudioPage() {
  // State
  const [title, setTitle] = useState("Untitled Creative");
  const [status, setStatus] = useState<CreativeStatus>("draft");
  const [selectedSpecKey, setSelectedSpecKey] = useState<PlacementSpecKey>("story_9_16");
  const [selectedSpecs, setSelectedSpecs] = useState<PlacementSpecKey[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [backgroundType, setBackgroundType] = useState<"checkerboard" | "solid">("checkerboard");

  // Custom size state
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customSize, setCustomSize] = useState({ width: 1080, height: 1080 });

  // UI State
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for export
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const creativeIdRef = useRef<string | null>(null);

  // Get all specs for tabs
  const tabsSpecs = useMemo(() => {
    const currentSpec = isCustomSize
      ? { category: "mobile" as DeviceCategory }
      : PLACEMENT_SPECS.find((s) => s.key === selectedSpecKey)!;
    return PLACEMENT_SPECS.filter((s) => s.category === currentSpec.category);
  }, [selectedSpecKey, isCustomSize]);

  // When switching category via sidebar, update preview to that spec
  const handleSpecSelect = (key: PlacementSpecKey) => {
    setSelectedSpecKey(key);
    setIsCustomSize(false);
  };

  // Handle custom size
  const handleCustomSize = (width: number, height: number) => {
    setCustomSize({ width, height });
    setIsCustomSize(true);
    setSelectedSpecKey("custom");
  };

  // Get selected spec (handle custom size)
  const selectedSpec = useMemo(() => {
    if (isCustomSize) {
      return {
        key: "custom" as PlacementSpecKey,
        label: `Custom ${customSize.width}×${customSize.height}`,
        category: "mobile" as DeviceCategory,
        width: customSize.width,
        height: customSize.height,
        aspectRatio: `${customSize.width}:${customSize.height}`,
        icon: "custom_size",
        shortLabel: "CUSTOM",
        safeArea: { top: 64, right: 64, bottom: 64, left: 64 },
        rules: { minTitleFontSize: 44, minBodyFontSize: 28, maxTitleLines: 2, maxBodyLines: 4 }
      };
    }
    return PLACEMENT_SPECS.find((s) => s.key === selectedSpecKey)!;
  }, [selectedSpecKey, isCustomSize, customSize]);

  // Get specs objects
  const selectedSpecObjects = useMemo(
    () => PLACEMENT_SPECS.filter((s) => selectedSpecs.includes(s.key)),
    [selectedSpecs]
  );

  // Handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In bypass mode, just save locally
      if (import.meta.env.VITE_BYPASS_AUTH === "true") {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setStatus("draft");
        console.log("Creative saved locally (bypass mode):", { title, spec: selectedSpecKey });
        alert("保存成功！");
        setIsSaving(false);
        return;
      }

      // Normal API call
      const response = await fetch("/api/creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          specKey: selectedSpecKey,
          content: { title, selectedSpecKey }
        })
      });

      if (response.ok) {
        const data = await response.json();
        creativeIdRef.current = data.creative.id;
        setStatus("draft");
        console.log("Creative saved:", data.creative);
        alert("保存成功！");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // In bypass mode, just update locally
      if (import.meta.env.VITE_BYPASS_AUTH === "true") {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStatus("published");
        console.log("Creative published locally (bypass mode):", { title, spec: selectedSpecKey });
        alert("发布成功！");
        setIsSaving(false);
        return;
      }

      // Normal API call
      if (creativeIdRef.current) {
        await fetch(`/api/creatives/${creativeIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, specKey: selectedSpecKey })
        });

        await fetch(`/api/creatives/${creativeIdRef.current}/publish`, {
          method: "POST"
        });
      } else {
        const response = await fetch("/api/creatives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            specKey: selectedSpecKey,
            status: "published"
          })
        });

        if (response.ok) {
          const data = await response.json();
          creativeIdRef.current = data.creative.id;
        }
      }

      setStatus("published");
      console.log("Creative published");
      alert("发布成功！");
    } catch (error) {
      console.error("Publish failed:", error);
      alert("发布失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  // Export handler
  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);
    setShowExportPanel(false);

    try {
      const container = previewContainerRef.current;
      if (!container) {
        throw new Error("Preview container not found");
      }

      // Get content from preview
      const originalContent = container.querySelector(".preview-content") as HTMLElement;
      if (!originalContent) {
        throw new Error("Preview content not found");
      }

      // Extract actual text content
      const titleText = originalContent.querySelector("h3")?.textContent || "Elevate Your Creative Workflow.";
      const descText = originalContent.querySelector("p")?.textContent || "Generate stunning NFT assets in seconds with AI-powered optimization.";
      const btnText = originalContent.querySelector("button")?.textContent || "MINT NOW";
      
      // Get background image
      const previewStyle = window.getComputedStyle(originalContent);
      const bgImage = previewStyle.backgroundImage;

      const downloadedFiles: string[] = [];

      for (let i = 0; i < selectedSpecObjects.length; i++) {
        const spec = selectedSpecObjects[i];
        setExportProgress(i + 1);

        try {
          // Create container with precise inline styles matching preview
          const containerEl = document.createElement("div");
          containerEl.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: ${spec.width}px;
            height: ${spec.height}px;
            background-image: ${bgImage};
            background-size: cover;
            background-position: center;
            overflow: hidden;
          `;

          // Inner wrapper - exact styles from preview
          const innerEl = document.createElement("div");
          innerEl.style.cssText = `
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: ${spec.safeArea.top}px ${spec.safeArea.right}px ${spec.safeArea.bottom}px ${spec.safeArea.left}px;
          `;

          // Top bar
          const topBar = document.createElement("div");
          topBar.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          `;

          // LIVE AD badge
          const liveBadge = document.createElement("span");
          liveBadge.textContent = "LIVE AD";
          liveBadge.style.cssText = `
            color: white;
            background: #6366f1;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Space Grotesk', Arial, sans-serif;
            font-size: 10px;
            font-weight: 700;
            line-height: 1;
            display: inline-block;
            margin: 4px 0 0 4px;
          `;

          // More icon (using unicode instead of material icons)
          const moreIcon = document.createElement("span");
          moreIcon.textContent = "⋮";
          moreIcon.style.cssText = `
            color: white;
            font-size: 20px;
            font-family: Arial, sans-serif;
            line-height: 1;
          `;

          topBar.appendChild(liveBadge);
          topBar.appendChild(moreIcon);
          innerEl.appendChild(topBar);

          // Bottom content
          const bottomContent = document.createElement("div");
          bottomContent.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
          `;

          // Title
          const titleEl = document.createElement("h3");
          titleEl.textContent = titleText;
          titleEl.style.cssText = `
            color: white;
            font-family: 'Space Grotesk', Arial, sans-serif;
            font-size: ${spec.rules.minTitleFontSize}px;
            font-weight: 900;
            line-height: 1.2;
            margin: 0;
          `;

          // Description
          const descEl = document.createElement("p");
          descEl.textContent = descText;
          descEl.style.cssText = `
            color: #cbd5e1;
            font-family: 'Space Grotesk', Arial, sans-serif;
            font-size: ${spec.rules.minBodyFontSize}px;
            font-weight: 400;
            line-height: 1.4;
            margin: 0;
          `;

          // Button
          const btnEl = document.createElement("button");
          btnEl.textContent = btnText;
          btnEl.style.cssText = `
            width: 100%;
            background: white;
            color: black;
            font-family: 'Space Grotesk', Arial, sans-serif;
            font-size: 16px;
            font-weight: 700;
            padding: 12px 24px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            margin-top: 8px;
          `;

          bottomContent.appendChild(titleEl);
          bottomContent.appendChild(descEl);
          bottomContent.appendChild(btnEl);
          innerEl.appendChild(bottomContent);

          containerEl.appendChild(innerEl);
          document.body.appendChild(containerEl);

          // Generate canvas
          const canvas = await html2canvas(containerEl, {
            width: spec.width,
            height: spec.height,
            scale: options.scale,
            backgroundColor: null,
            logging: false,
            useCORS: true,
          });

          // Download
          const link = document.createElement("a");
          link.download = `${title.replace(/\s+/g, "_")}_${spec.key}_${spec.width}x${spec.height}.${options.format}`;
          link.href = canvas.toDataURL(`image/${options.format}`, options.quality);
          link.click();

          downloadedFiles.push(link.download);

          // Cleanup
          document.body.removeChild(containerEl);
        } catch (err) {
          console.error(`Failed to export ${spec.key}:`, err);
        }
      }

      alert(`成功导出 ${downloadedFiles.length} 个文件！\n\n${downloadedFiles.join("\n")}`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleCancelExport = () => {
    setIsExporting(false);
    setExportProgress(0);
  };

  // Mock preview content
  const PreviewContent = (
    <div
      className="preview-content absolute inset-0 bg-cover bg-center"
      data-alt="Vibrant creative design preview"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDCCtDRR_Zh-XCvY0VfLpI52OgdP08RqES2oamkUkgNHnbr8CwO8J3hxl6nWGtypRFTblw7j2bIMiaMX_u1hkQ05wbc3cs43id3tkDitpUwJyjeCKb9G0UDMb7ymy-Aqf1oem57vEr-yb4HnI6hcv144RuoG9qAey1i_n7ASpQg_WE_W8YDHteCQEz8qg5dC-RKtxf6VT12nniJoVhssZNDdERzNS5V8ayLkKpDon5NWXU6hdbAx1ylv5pf0QlNRaYa4LKApCvGvw')",
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
        <div className="flex justify-between items-start">
          <span className="bg-primary px-2 py-1 rounded text-[10px] font-bold">LIVE AD</span>
          <span className="material-symbols-outlined text-white">more_vert</span>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-white leading-tight">
            Elevate Your Creative Workflow.
          </h3>
          <p className="text-sm text-slate-200">
            Generate stunning NFT assets in seconds with AI-powered optimization.
          </p>
          <button className="w-full bg-white text-black font-bold py-3 rounded-xl">
            MINT NOW
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Toolbar */}
      <PreviewToolbar
        title={title}
        onTitleChange={setTitle}
        version="V1"
        status={status}
        onSave={handleSave}
        onPublish={status === "draft" ? handlePublish : undefined}
        canPublish={status === "draft"}
        isSaving={isSaving}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Device & Size Picker */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col p-4 shrink-0">
          <DeviceSizePicker
            selectedSpecKey={selectedSpecKey}
            onSpecSelect={handleSpecSelect}
            selectedSpecs={selectedSpecs}
            onBatchSelect={setSelectedSpecs}
            onCategoryChange={(_, firstSpecKey) => setSelectedSpecs([firstSpecKey])}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0b0f1a] relative overflow-hidden">
          {/* Top Controls Bar */}
          <div className="flex items-center justify-between gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
            {/* Left Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={cn(showGrid && "text-primary")}
              >
                <span className="material-symbols-outlined">grid_4x4</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSafeZone(!showSafeZone)}
                className={cn(showSafeZone && "text-primary")}
              >
                <span className="material-symbols-outlined">shield</span>
              </Button>
              <div className="w-px h-6 bg-slate-700 mx-2" />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {/* Batch Export Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExportPanel(true)}
              >
                <span className="material-symbols-outlined">download</span>
                <span>Export All ({selectedSpecs.length})</span>
              </Button>
            </div>
          </div>

          {/* Device Tabs */}
          <DeviceTabs
            specs={tabsSpecs}
            activeSpecKey={selectedSpecKey}
            onSpecSelect={handleSpecSelect}
            onCustomClick={handleCustomSize}
          />

          {/* Preview Canvas */}
          <div ref={previewContainerRef} className="flex-1 relative">
            <PreviewCanvas
              spec={selectedSpec}
              showGrid={showGrid}
              showSafeZone={showSafeZone}
              backgroundType={backgroundType}
            >
              {PreviewContent}
            </PreviewCanvas>
          </div>

          {/* Export Panel Modal */}
          {showExportPanel && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <ExportPanel
                selectedSpecs={selectedSpecObjects}
                isExporting={isExporting}
                exportProgress={exportProgress}
                onExport={handleExport}
                onCancel={() => setShowExportPanel(false)}
                className="w-96"
              />
            </div>
          )}

          {/* Export Progress Overlay */}
          {isExporting && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
              <ExportPanel
                selectedSpecs={selectedSpecObjects}
                isExporting={isExporting}
                exportProgress={exportProgress}
                onExport={() => {}}
                onCancel={handleCancelExport}
                className="w-80"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/preview-studio")({
  component: PreviewStudioPage,
});
