import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  const [originalIntent, setOriginalIntent] = useState("");
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Brand assets
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);

  // Style parameters
  const [selectedStyle, setSelectedStyle] = useState("minimal_tech");
  const [selectedColor, setSelectedColor] = useState("primary");
  const [selectedPlatform, setSelectedPlatform] = useState("mobile");

  // Generation state
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [creatives, setCreatives] = useState<
    Partial<Record<PlacementSpecKey, { image?: GeneratedImage; loading?: boolean; error?: string }>>
  >({});
  
  // Track which placement to generate next
  const [nextPlacementIndex, setNextPlacementIndex] = useState(0);

  // Selected candidate state
  const [selectedCandidate, setSelectedCandidate] = useState<PlacementSpecKey | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Preview modal state
  const [previewImage, setPreviewImage] = useState<{ imageUrl: string; aspectRatio: string; label: string } | null>(null);

  // Flash notification state
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ref to prevent duplicate save calls
  const isSavingRef = useRef(false);

  // Sync URL changes to local state
  useEffect(() => {
    if (urlProjectId) {
      setSelectedProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Ref to prevent duplicate project creation (React 18 Strict Mode calls effects twice)
  const isCreatingProjectRef = useRef(false);

  // Auto-create a new project if no project selected
  useEffect(() => {
    async function createNewProject() {
      if (urlProjectId) return;
      if (isCreatingProjectRef.current) return;
      
      isCreatingProjectRef.current = true;
      
      try {
        const { project } = await apiClient.createProject("Untitled Project");
        if (project?.id) {
          navigate({ to: "/creative-studio", search: { projectId: project.id }, replace: true });
        }
      } catch (error) {
        console.error("Failed to create new project:", error);
        isCreatingProjectRef.current = false;
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
        // Load project details including name and current creative
        const { project } = await apiClient.getProject(selectedProjectId);
        let currentCreativeUrl: string | undefined;
        if (project) {
          const name = project.title || "Untitled Project";
          setProjectName(name);
          setOriginalProjectName(name);
          // Get the current creative URL from the project's creatives
          currentCreativeUrl = project.creatives?.[0]?.url;
        }

        // Load briefs
        const { briefs } = await apiClient.getBriefsByProjectId(selectedProjectId);

        if (briefs && briefs.length > 0) {
          const briefWithDrafts = briefs.find(b => b.drafts && b.drafts.length > 0);
          const latestBrief = briefWithDrafts ?? briefs[0];

          setBriefId(latestBrief.id);
          setIntent(latestBrief.intentText);
          setOriginalIntent(latestBrief.intentText);

          if (latestBrief.drafts && latestBrief.drafts.length > 0) {
            const loadedCreatives: Partial<Record<PlacementSpecKey, { image?: GeneratedImage; loading?: boolean; error?: string }>> = {};
            let matchedPlacement: PlacementSpecKey | null = null;
            let firstPlacement: PlacementSpecKey | null = null;
            
            for (const draft of latestBrief.drafts) {
              const draftData = draft.draftJson as Draft["draftJson"];
              if (draftData.placement && draftData.imageUrl && draftData.aspectRatio) {
                loadedCreatives[draftData.placement] = {
                  image: {
                    imageUrl: draftData.imageUrl,
                    aspectRatio: draftData.aspectRatio
                  }
                };
                
                // Track the first placement for fallback selection
                if (!firstPlacement) {
                  firstPlacement = draftData.placement;
                }
                
                // Check if this draft matches the current creative URL
                if (currentCreativeUrl && draftData.imageUrl === currentCreativeUrl) {
                  matchedPlacement = draftData.placement;
                }
              }
            }
            setCreatives(loadedCreatives);
            
            // Auto-select the creative that matches the project's current creative URL
            // If no match found, select the first available creative
            if (matchedPlacement) {
              setSelectedCandidate(matchedPlacement);
            } else if (firstPlacement) {
              setSelectedCandidate(firstPlacement);
            }
            
            // Update nextPlacementIndex to skip already generated placements
            // Find the highest index of already generated placements + 1
            const generatedPlacements = Object.keys(loadedCreatives) as PlacementSpecKey[];
            let maxIndex = -1;
            for (const placement of generatedPlacements) {
              const index = DEFAULT_PLACEMENTS.indexOf(placement);
              if (index > maxIndex) {
                maxIndex = index;
              }
            }
            setNextPlacementIndex(maxIndex + 1);
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

  // Generate one candidate at a time (click once, generate one)
  const handleGenerateCandidate = async () => {
    if (!selectedProjectId || intent.trim().length === 0 || isGeneratingBrief) return;
    
    // Check if all candidates have been generated
    if (nextPlacementIndex >= DEFAULT_PLACEMENTS.length) {
      setFlashMessage({ type: "error", text: "All candidates have been generated" });
      return;
    }
    
    const placement = DEFAULT_PLACEMENTS[nextPlacementIndex];
    setIsGeneratingBrief(true);

    // Set only the current placement to loading
    setCreatives((prev) => ({
      ...prev,
      [placement]: { loading: true }
    }));

    try {
      // Check if intent was modified and handle brief creation/update
      let currentBriefId = briefId;
      const intentModified = intent.trim() !== originalIntent.trim();
      
      if (!currentBriefId) {
        // No brief exists, create a new one
        const created = await apiClient.createBrief(selectedProjectId, {
          intentText: intent,
          placements: DEFAULT_PLACEMENTS
        });
        currentBriefId = created?.brief?.id;
        if (!currentBriefId) {
          throw new Error("Failed to create brief");
        }
        setBriefId(currentBriefId);
        setOriginalIntent(intent);
      } else if (intentModified) {
        // Brief exists but intent was modified, update the brief
        await apiClient.updateBrief(currentBriefId, {
          intentText: intent
        });
        setOriginalIntent(intent);
      }

      // Generate creative for the current placement
      const response = await apiClient.generateCreative({
        briefId: currentBriefId,
        placement,
        brandAssets: brandAssets.length > 0 ? brandAssets : undefined
      });
      
      if (response?.image) {
        setCreatives((prev) => ({
          ...prev,
          [placement]: { image: response.image, loading: false }
        }));
        // Move to next placement
        setNextPlacementIndex((prev) => prev + 1);
      } else {
        setCreatives((prev) => ({
          ...prev,
          [placement]: { loading: false, error: "No image returned" }
        }));
      }
    } catch (error) {
      console.error("Failed to generate candidate:", error);
      setCreatives((prev) => ({
        ...prev,
        [placement]: {
          loading: false,
          error: error instanceof Error ? error.message : "Failed to generate"
        }
      }));
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  // Regenerate only the selected candidate
  const handleRegenerateSelected = async () => {
    if (!briefId || !selectedCandidate) return;
    
    // Set only the selected placement to loading
    setCreatives((prev) => ({
      ...prev,
      [selectedCandidate]: { loading: true }
    }));

    try {
      const response = await apiClient.generateCreative({
        briefId,
        placement: selectedCandidate,
        brandAssets: brandAssets.length > 0 ? brandAssets : undefined
      });
      if (response?.image) {
        setCreatives((prev) => ({
          ...prev,
          [selectedCandidate]: { image: response.image, loading: false }
        }));
      } else {
        setCreatives((prev) => ({
          ...prev,
          [selectedCandidate]: { loading: false, error: "No image returned" }
        }));
      }
    } catch (error) {
      setCreatives((prev) => ({
        ...prev,
        [selectedCandidate]: {
          loading: false,
          error: error instanceof Error ? error.message : "Failed to generate"
        }
      }));
    }
  };

  // Auto-dismiss flash message after 3 seconds
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  // Save project with selected candidate's URL
  const handleSaveProject = useCallback(async () => {
    // Use ref-based guard to prevent duplicate calls (more reliable than state)
    if (!selectedProjectId || isSavingRef.current) return;
    
    // Get the selected candidate's URL, or the first available one
    let creativeUrl: string | undefined;
    
    if (selectedCandidate && creatives[selectedCandidate]?.image?.imageUrl) {
      creativeUrl = creatives[selectedCandidate].image?.imageUrl;
    } else {
      // Find the first candidate with an image
      for (const placement of DEFAULT_PLACEMENTS) {
        if (creatives[placement]?.image?.imageUrl) {
          creativeUrl = creatives[placement].image?.imageUrl;
          break;
        }
      }
    }
    
    if (!creativeUrl) {
      setFlashMessage({ type: "error", text: "No creative to save" });
      return;
    }
    
    // Set ref guard immediately (synchronous)
    isSavingRef.current = true;
    setIsSavingProject(true);
    
    try {
      // Update both creativeUrl (for Creative record) and imageUrl (for project preview in list)
      await apiClient.updateProject(selectedProjectId, { creativeUrl, imageUrl: creativeUrl });
      setFlashMessage({ type: "success", text: "Project saved successfully!" });
    } catch (error) {
      console.error("Failed to save project:", error);
      setFlashMessage({ type: "error", text: "Failed to save project" });
    } finally {
      isSavingRef.current = false;
      setIsSavingProject(false);
    }
  }, [selectedProjectId, selectedCandidate, creatives, apiClient]);

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
      {/* Flash Notification */}
      {flashMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
            flashMessage.type === "success"
              ? "bg-green-500 text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {flashMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-sm font-medium">{flashMessage.text}</span>
          <button
            type="button"
            onClick={() => setFlashMessage(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

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
          <button
            type="button"
            onClick={handleSaveProject}
            disabled={isSavingProject || !hasCreatives}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">{isSavingProject ? "sync" : "save"}</span>
            <span>{isSavingProject ? "Saving..." : "Save"}</span>
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
                
                const isSelected = selectedCandidate === placement;
                
                return (
                  <div
                    key={placement}
                    onClick={() => state?.image && setSelectedCandidate(placement)}
                    className={`aspect-square rounded-2xl border bg-card relative overflow-hidden group cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary border-2 shadow-[0_0_40px_rgba(59,130,246,0.3)] ring-2 ring-primary/50"
                        : state?.image
                          ? "border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-primary"
                          : "border-border"
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-20 bg-primary text-primary-foreground rounded-full size-6 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                    )}
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
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
                          <p className="text-xs font-medium text-foreground">{spec.label}</p>
                        </div>
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (state?.image) {
                                setPreviewImage({
                                  imageUrl: state.image.imageUrl,
                                  aspectRatio: state.image.aspectRatio,
                                  label: spec.label
                                });
                              }
                            }}
                            className="bg-white text-primary font-bold px-8 py-3 rounded-lg flex items-center gap-2"
                          >
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
              onClick={handleGenerateCandidate}
              disabled={!intent.trim() || isGeneratingBrief || nextPlacementIndex >= DEFAULT_PLACEMENTS.length}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">auto_fix_high</span>
              {isGeneratingBrief
                ? "Generating..."
                : nextPlacementIndex >= DEFAULT_PLACEMENTS.length
                  ? "All Generated"
                  : `Generate Candidate`}
            </button>
            <button
              type="button"
              onClick={handleRegenerateSelected}
              disabled={!briefId || !selectedCandidate || isGenerating}
              className="w-full bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-border transition-all"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              {selectedCandidate ? `Regenerate Selected` : "Select a Candidate"}
            </button>
          </div>
        </section>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] bg-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background text-foreground rounded-full size-10 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            {/* Image */}
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={previewImage.imageUrl}
                alt={previewImage.label}
                className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
              />
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white font-bold text-lg">{previewImage.label}</p>
              <p className="text-white/70 text-sm">Aspect Ratio: {previewImage.aspectRatio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
