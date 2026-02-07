import { useState, useMemo, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PLACEMENT_SPECS, type PlacementSpecKey } from "../../../../shared/src/placementSpecs";
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
  const [selectedSpecs, setSelectedSpecs] = useState<PlacementSpecKey[]>(["story_9_16"]);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [backgroundType, setBackgroundType] = useState<"checkerboard" | "solid">("checkerboard");
  
  // Export state
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Refs for export
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Get selected spec
  const selectedSpec = useMemo(
    () => PLACEMENT_SPECS.find((s) => s.key === selectedSpecKey)!,
    [selectedSpecKey]
  );

  // Get all specs for tabs
  const tabsSpecs = useMemo(() => PLACEMENT_SPECS.filter((s) => s.category === selectedSpec.category), [selectedSpec.category]);

  // Get specs objects
  const selectedSpecObjects = useMemo(
    () => PLACEMENT_SPECS.filter((s) => selectedSpecs.includes(s.key)),
    [selectedSpecs]
  );

  // Handlers
  const handleSave = () => {
    console.log("Saving creative:", { title, spec: selectedSpecKey });
    // TODO: API call to save
    setStatus("draft");
  };

  const handlePublish = () => {
    console.log("Publishing creative:", { title, spec: selectedSpecKey });
    // TODO: API call to publish
    setStatus("published");
  };

  const handlePurchase = () => {
    console.log("Purchasing creative:", { title, spec: selectedSpecKey });
    // TODO: API call to purchase
    setStatus("purchased");
  };

  // Export handler
  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);
    setShowExportPanel(false);

    try {
      // Get the preview container
      const container = previewContainerRef.current;
      if (!container) {
        throw new Error("Preview container not found");
      }

      // Get device frames within the container
      const deviceFrames = container.querySelectorAll(".device-frame-export");
      
      const downloadedFiles: string[] = [];

      for (let i = 0; i < selectedSpecObjects.length; i++) {
        const spec = selectedSpecObjects[i];
        setExportProgress(i + 1);

        try {
          // Create a temporary container for this export
          const tempContainer = document.createElement("div");
          tempContainer.style.width = `${spec.width}px`;
          tempContainer.style.height = `${spec.height}px`;
          tempContainer.style.position = "fixed";
          tempContainer.style.left = "-9999px";
          tempContainer.style.top = "0";
          document.body.appendChild(tempContainer);

          // Clone the preview content
          const originalContent = container.querySelector(".preview-content");
          if (originalContent) {
            const clonedContent = originalContent.cloneNode(true) as HTMLElement;
            
            // Apply background
            if (options.backgroundColor) {
              clonedContent.style.backgroundColor = options.backgroundColor;
              clonedContent.style.backgroundImage = "none";
            }
            
            tempContainer.appendChild(clonedContent);

            // Generate canvas
            const canvas = await html2canvas(tempContainer, {
              width: spec.width,
              height: spec.height,
              scale: options.scale,
              backgroundColor: options.backgroundColor,
              logging: false,
            });

            // Download file
            const link = document.createElement("a");
            link.download = `${title.replace(/\s+/g, "_")}_${spec.key}_${spec.width}x${spec.height}.${options.format}`;
            link.href = canvas.toDataURL(`image/${options.format}`, options.quality);
            link.click();

            downloadedFiles.push(link.download);
          }

          // Clean up
          document.body.removeChild(tempContainer);
        } catch (err) {
          console.error(`Failed to export ${spec.key}:`, err);
        }
      }

      // Show success message
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
        onPurchase={status === "draft" ? handlePurchase : undefined}
        canPublish={status === "draft"}
        canPurchase={status === "draft"}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Device & Size Picker */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col p-4 shrink-0">
          <DeviceSizePicker
            selectedSpecKey={selectedSpecKey}
            onSpecSelect={setSelectedSpecKey}
            selectedSpecs={selectedSpecs}
            onBatchSelect={setSelectedSpecs}
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

              {/* AI Auto-Fix Button */}
              <Button variant="primary" size="sm">
                <span className="material-symbols-outlined fill-1">auto_fix_high</span>
                <span>AI Auto-Fix</span>
              </Button>
            </div>
          </div>

          {/* Device Tabs */}
          <DeviceTabs
            specs={tabsSpecs}
            activeSpecKey={selectedSpecKey}
            onSpecSelect={setSelectedSpecKey}
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
