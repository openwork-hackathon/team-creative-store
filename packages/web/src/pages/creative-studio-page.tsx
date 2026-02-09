import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/_authenticated/creative-studio";
import { createApiClient, type ApiClient, type Draft } from "@/lib/api";
import { AiCreativePreview } from "@/components/creative/ai-creative-preview";
import {
  PLACEMENT_SPEC_BY_KEY,
  type GeneratedImage,
  type BrandAsset,
  type PlacementSpecKey
} from "@creative-store/shared";

const DEFAULT_PLACEMENTS: PlacementSpecKey[] = [
  "square_1_1",
  "feed_4_5",
  "story_9_16"
];

const STYLE_PRESETS = [
  { id: "minimal_tech", label: "Minimal Tech", icon: "precision_manufacturing" },
  { id: "luxury_elite", label: "Luxury Elite", icon: "diamond" },
  { id: "vibrant_creative", label: "Vibrant Creative", icon: "palette" }
];

const COLOR_PALETTE = [
  { id: "primary", color: "hsl(var(--primary))", label: "Primary Blue" },
  { id: "dark", color: "#111722", label: "Dark" },
  { id: "purple", color: "#a855f7", label: "Purple" },
  { id: "emerald", color: "#10b981", label: "Emerald" },
  { id: "orange", color: "#f97316", label: "Orange" }
];

const PLATFORM_OPTIONS = [
  { id: "mobile", label: "Mobile", icon: "smartphone" },
  { id: "web", label: "Web", icon: "laptop" },
  { id: "tv", label: "TV", icon: "tv" }
];

type CreativeStudioPageProps = {
  api?: ApiClient;
};

export function CreativeStudioPage({ api }: CreativeStudioPageProps) {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = Route.useSearch();
  const apiClient = useMemo(() => api ?? createApiClient(), [api]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    urlProjectId ?? null
  );

  // Project state
  const [projectName, setProjectName] = useState("Untitled Project");
  const [originalProjectName, setOriginalProjectName] = useState("Untitled Project");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // Brief state
  const [briefId, setBriefId] = useState<string | null>(null);
  const [intent, setIntent] = useState("");
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Brand assets
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);

  // Style parameters
  const [selectedStyle, setSelectedStyle] = useState("minimal_tech");
  const [selectedColor, setSelectedColor] = useState("primary");
  const [selectedPlatform, setSelectedPlatform] = useState("mobile");
  const [density, setDensity] = useState(75);
  const [strictGrid, setStrictGrid] = useState(true);
  const [aiOptimization, setAiOptimization] = useState(false);

  // Generation state
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [creatives, setCreatives] = useState<
    Partial<Record<PlacementSpecKey, { image?: GeneratedImage; loading?: boolean; error?: string }>>
  >({});

  // Sync URL changes to local state
  useEffect(() => {
    if (urlProjectId) {
      setSelectedProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Auto-create a new project if no project selected
  useEffect(() => {
    async function createNewProject() {
      if (urlProjectId) return;
      
      try {
        const { project } = await apiClient.createProject("Untitled Project");
        if (project?.id) {
          navigate({ to: "/creative-studio", search: { projectId: project.id }, replace: true });
        }
      } catch (error) {
        console.error("Failed to create new project:", error);
        navigate({ to: "/projects" });
      }
    }
    
    createNewProject();
  }, [urlProjectId, navigate, apiClient]);

  // Load existing project data, briefs and drafts on mount
  useEffect(() => {
    async function loadExistingData() {
      if (!selectedProjectId) {
        setIsLoadingExisting(false);
        return;
      }
      try {
        // Load project details including name
        const { project } = await apiClient.getProject(selectedProjectId);
        if (project) {
          const name = project.title || "Untitled Project";
          setProjectName(name);
          setOriginalProjectName(name);
        }

        // Load briefs
        const { briefs } = await apiClient.getBriefsByProjectId(selectedProjectId);

        if (briefs && briefs.length > 0) {
          const briefWithDrafts = briefs.find(b => b.drafts && b.drafts.length > 0);
          const latestBrief = briefWithDrafts ?? briefs[0];

          setBriefId(latestBrief.id);
          setIntent(latestBrief.intentText);

          if (latestBrief.drafts && latestBrief.drafts.length > 0) {
            const loadedCreatives: Partial<Record<PlacementSpecKey, { image?: GeneratedImage; loading?: boolean; error?: string }>> = {};
            for (const draft of latestBrief.drafts) {
              const draftData = draft.draftJson as Draft["draftJson"];
              if (draftData.placement && draftData.imageUrl && draftData.aspectRatio) {
                loadedCreatives[draftData.placement] = {
                  image: {
                    imageUrl: draftData.imageUrl,
                    aspectRatio: draftData.aspectRatio
                  }
                };
              }
            }
            setCreatives(loadedCreatives);
          }
        }
      } catch (error) {
        console.error("Failed to load existing data:", error);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    loadExistingData();
  }, [selectedProjectId, apiClient]);

  // Save project name when editing is finished
  const handleSaveProjectName = useCallback(async () => {
    setIsEditingName(false);
    if (!selectedProjectId || projectName === originalProjectName || !projectName.trim()) {
      // Reset to original if empty
      if (!projectName.trim()) {
        setProjectName(originalProjectName);
      }
      return;
    }
    
    setIsSavingName(true);
    try {
      await apiClient.updateProject(selectedProjectId, { name: projectName.trim() });
      setOriginalProjectName(projectName.trim());
    } catch (error) {
      console.error("Failed to save project name:", error);
      // Revert to original on error
      setProjectName(originalProjectName);
    } finally {
      setIsSavingName(false);
    }
  }, [selectedProjectId, projectName, originalProjectName, apiClient]);

  const fileToBrandAsset = (file: File, kind: BrandAsset["kind"]) =>
    new Promise<BrandAsset>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read file"));
          return;
        }
        const [, dataBase64 = ""] = reader.result.split(",");
        resolve({
          kind,
          mimeType: file.type || "application/octet-stream",
          dataBase64,
          name: file.name
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const assets = await Promise.all(
        Array.from(files).map((file) => fileToBrandAsset(file, "logo"))
      );
      setBrandAssets((prev) => [...prev, ...assets]);
    } catch {
      return;
    }
  };

  const handleRemoveAsset = (index: number) => {
    setBrandAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateCandidates = async () => {
    if (!selectedProjectId || intent.trim().length === 0 || isGeneratingBrief) return;
    setIsGeneratingBrief(true);

    // Set all placements to loading
    const loadingState: Partial<Record<PlacementSpecKey, { loading: boolean }>> = {};
    DEFAULT_PLACEMENTS.forEach(p => {
      loadingState[p] = { loading: true };
    });
    setCreatives(loadingState);

    try {
      const created = await apiClient.createBrief(selectedProjectId, {
        intentText: intent,
        placements: DEFAULT_PLACEMENTS
      });
      const newBriefId = created?.brief?.id;
      if (!newBriefId) {
        throw new Error("Failed to create brief");
      }
      setBriefId(newBriefId);

      // Generate creatives for each placement
      for (const placement of DEFAULT_PLACEMENTS) {
        try {
          const response = await apiClient.generateCreative({
            briefId: newBriefId,
            placement,
            brandAssets: brandAssets.length > 0 ? brandAssets : undefined
          });
          if (response?.image) {
            setCreatives((prev) => ({
              ...prev,
              [placement]: { image: response.image, loading: false }
            }));
          } else {
            setCreatives((prev) => ({
              ...prev,
              [placement]: { loading: false, error: "No image returned" }
            }));
          }
        } catch (error) {
          setCreatives((prev) => ({
            ...prev,
            [placement]: {
              loading: false,
              error: error instanceof Error ? error.message : "Failed to generate"
            }
          }));
        }
      }
    } catch (error) {
      console.error("Failed to generate candidates:", error);
      // Reset loading state on error
      DEFAULT_PLACEMENTS.forEach(p => {
        setCreatives((prev) => ({
          ...prev,
          [p]: { loading: false, error: "Failed to generate" }
        }));
      });
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (!briefId) return;
    
    const loadingState: Partial<Record<PlacementSpecKey, { loading: boolean }>> = {};
    DEFAULT_PLACEMENTS.forEach(p => {
      loadingState[p] = { loading: true };
    });
    setCreatives(loadingState);

    for (const placement of DEFAULT_PLACEMENTS) {
      try {
        const response = await apiClient.generateCreative({
          briefId,
          placement,
          brandAssets: brandAssets.length > 0 ? brandAssets : undefined
        });
        if (response?.image) {
          setCreatives((prev) => ({
            ...prev,
            [placement]: { image: response.image, loading: false }
          }));
        }
      } catch (error) {
        setCreatives((prev) => ({
          ...prev,
          [placement]: {
            loading: false,
            error: error instanceof Error ? error.message : "Failed to generate"
          }
        }));
      }
    }
  };

  // Show loading skeleton while fetching existing data or if no project selected
  if (isLoadingExisting) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  const hasCreatives = Object.values(creatives).some(c => c?.image);
  const isGenerating = Object.values(creatives).some(c => c?.loading);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 px-10 py-6 border-b border-border bg-background">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-3xl font-bold leading-tight">Creative Generator</h2>
          <p className="text-muted-foreground text-sm">Define project intent, manage brand assets, and generate candidates.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 mr-6 bg-card/40 px-4 py-2 rounded-lg border border-border">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Credits:</p>
            <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%]" />
            </div>
            <p className="text-muted-foreground text-[10px]">750/1000</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-sm">publish</span>
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Project Settings & Intent */}
        <section className="w-96 border-r border-border overflow-y-auto bg-background p-8 flex flex-col gap-8">
          {/* Project Name */}
          <div>
            <h3 className="text-foreground text-base font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">folder</span>
              Project Name
            </h3>
            <div className="flex flex-col gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={handleSaveProjectName}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveProjectName()}
                  autoFocus
                  className="w-full bg-card border border-border rounded-lg p-3 text-foreground text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  disabled={isSavingName}
                  className="w-full flex items-center justify-between bg-card border border-border rounded-lg p-3 text-foreground text-sm hover:bg-muted transition-colors text-left"
                >
                  <span>{isSavingName ? "Saving..." : projectName}</span>
                  <span className="material-symbols-outlined text-muted-foreground text-sm">
                    {isSavingName ? "sync" : "edit"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Project Intent */}
          <div>
            <h3 className="text-foreground text-base font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Project Intent
            </h3>
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Design Brief</span>
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg p-4 text-foreground text-sm focus:ring-1 focus:ring-primary focus:outline-none min-h-[200px] resize-none placeholder:text-muted-foreground"
                  placeholder="Describe your design goals, target audience, and key messaging..."
                />
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Selection</span>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORM_OPTIONS.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                        selectedPlatform === platform.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="material-symbols-outlined">{platform.icon}</span>
                      <span className="text-[10px] font-bold mt-1">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brand Assets */}
          <div>
            <h3 className="text-foreground text-base font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              Brand Assets
            </h3>
            <div className="space-y-4">
              <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-card/30 hover:bg-card transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAssetUpload}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-muted-foreground text-4xl">cloud_upload</span>
                <p className="text-xs text-muted-foreground mt-3 text-center font-medium">Drop logo, icons or font files here</p>
              </label>
              {brandAssets.map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded bg-muted flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-foreground">image</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs font-medium text-foreground">{asset.name}</p>
                      <p className="text-[10px] text-muted-foreground">{asset.kind}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Center - Generated Candidates */}
        <section className="flex-1 overflow-y-auto bg-muted/30 p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-foreground text-xl font-bold">Generated Candidates</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className={`size-2 rounded-full ${isGenerating ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
              {isGenerating ? "Generating..." : "AI Engine Online"}
            </div>
          </div>

          {!hasCreatives && !isGenerating ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="size-24 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-muted-foreground">auto_awesome</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">No Candidates Yet</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Fill in your project intent and click "Generate Candidates" to create AI-powered creative variations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
              {DEFAULT_PLACEMENTS.map((placement, index) => {
                const state = creatives[placement];
                const spec = PLACEMENT_SPEC_BY_KEY[placement];
                
                return (
                  <div
                    key={placement}
                    className={`aspect-square rounded-2xl border bg-card relative overflow-hidden group ${
                      state?.image ? "border-primary shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "border-border"
                    }`}
                  >
                    {state?.loading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/40 backdrop-blur-sm z-10">
                        <div className="size-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="text-center">
                          <p className="text-foreground font-bold">Generating Version {String(index + 1).padStart(2, "0")}...</p>
                          <p className="text-muted-foreground text-xs">Applying {selectedStyle.replace("_", " ")} style</p>
                        </div>
                      </div>
                    ) : state?.error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                        <span className="material-symbols-outlined text-4xl text-destructive">error</span>
                        <p className="text-sm text-destructive text-center">{state.error}</p>
                      </div>
                    ) : state?.image ? (
                      <>
                        <div className="w-full h-full">
                          <AiCreativePreview
                            imageUrl={state.image.imageUrl}
                            aspectRatio={state.image.aspectRatio}
                            title={`${spec.label} preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-tighter">
                            Candidate V{index + 1}
                          </span>
                          <button className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-lg">star</span>
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
                          <p className="text-xs font-medium text-foreground">{spec.label}</p>
                          <p className="text-[10px] text-muted-foreground">{spec.width}×{spec.height}</p>
                        </div>
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                          <button className="bg-white text-primary font-bold px-8 py-3 rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined">zoom_in</span> View Details
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full opacity-20 bg-gradient-to-br from-primary to-purple-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Sidebar - Style Parameters */}
        <section className="w-96 border-l border-border bg-background p-8 flex flex-col gap-8">
          <div>
            <h3 className="text-foreground text-base font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              Style Parameters
            </h3>
            <div className="flex flex-col gap-6">
              {/* Style Preset */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style Preset</span>
                <div className="space-y-3">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-base">{style.icon}</span>
                        <span className="text-sm font-medium">{style.label}</span>
                      </div>
                      {selectedStyle === style.id && (
                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Harmony */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color Harmony</span>
                <div className="flex gap-3">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color.id)}
                      title={color.label}
                      className={`size-8 rounded-full border cursor-pointer transition-transform hover:scale-110 ${
                        selectedColor === color.id
                          ? "border-2 border-white ring-4 ring-primary/20"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-8 border-t border-border space-y-4">
            <button
              type="button"
              onClick={handleGenerateCandidates}
              disabled={!intent.trim() || isGeneratingBrief}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">auto_fix_high</span>
              {isGeneratingBrief ? "Generating..." : "Generate Candidates"}
            </button>
            <button
              type="button"
              onClick={handleRegenerateAll}
              disabled={!briefId || isGenerating}
              className="w-full bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-border transition-all"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Re-generate All
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
