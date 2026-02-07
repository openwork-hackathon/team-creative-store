import { useMemo, useState } from "react";
import {
  PLACEMENT_SPEC_BY_KEY,
  type AiCreativeOutput,
  type BrandAsset,
  type PlacementSpecKey
} from "@creative-store/shared";
import { CampaignBrief } from "@/components/campaign/campaign-brief";
import { IntentInput } from "@/components/campaign/intent-input";
import { StepBadge } from "@/components/campaign/step-badge";
import { UploadZone } from "@/components/campaign/upload-zone";
import { AiCreativePreview } from "@/components/creative/ai-creative-preview";
import { createApiClient, type ApiClient } from "@/lib/api";
import { getBriefSummary } from "@/lib/brief-summary";

const DEFAULT_PLACEMENTS: PlacementSpecKey[] = [
  "square_1_1",
  "feed_4_5",
  "story_9_16"
];

type CampaignGeneratorProps = {
  projectId: string;
  api?: ApiClient;
};

export function CampaignGenerator({ projectId, api }: CampaignGeneratorProps) {
  const apiClient = useMemo(() => api ?? createApiClient(), [api]);
  const [briefId, setBriefId] = useState<string | null>(null);
  const [intent, setIntent] = useState("");
  const [summary, setSummary] = useState(() => getBriefSummary({}));
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [creatives, setCreatives] = useState<
    Partial<Record<PlacementSpecKey, { creative?: AiCreativeOutput; loading?: boolean; error?: string }>>
  >({});

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

  const handleAssetSelect = async (kind: BrandAsset["kind"], files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const assets = await Promise.all(
        Array.from(files).map((file) => fileToBrandAsset(file, kind))
      );
      setBrandAssets((prev) => [...prev.filter((asset) => asset.kind !== kind), ...assets]);
    } catch {
      return;
    }
  };

  const handleGenerate = async () => {
    if (!projectId || intent.trim().length === 0) return;
    const created = await apiClient.createBrief(projectId, {
      intentText: intent,
      placements: DEFAULT_PLACEMENTS
    });
    const briefId = created?.brief?.id;
    if (!briefId) return;
    setBriefId(briefId);
    const briefResponse = await apiClient.getBrief(briefId);
    setSummary(getBriefSummary(briefResponse.brief ?? {}));
  };

  const handleGenerateCreative = async (placement: PlacementSpecKey) => {
    if (!briefId) return;
    setCreatives((prev) => ({
      ...prev,
      [placement]: { ...prev[placement], loading: true, error: undefined }
    }));
    try {
      const response = await apiClient.generateCreative({
        briefId,
        placement,
        brandAssets: brandAssets.length > 0 ? brandAssets : undefined
      });
      if (!response?.creative) {
        throw new Error("No creative returned");
      }
      setCreatives((prev) => ({
        ...prev,
        [placement]: { creative: response.creative, loading: false }
      }));
    } catch (error) {
      setCreatives((prev) => ({
        ...prev,
        [placement]: {
          ...prev[placement],
          loading: false,
          error: error instanceof Error ? error.message : "Failed to generate creative"
        }
      }));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-[-0.033em] text-foreground md:text-4xl">
          AI Campaign Generator
        </h1>
        <p className="text-base text-muted-foreground">
          Enter your intent and upload assets to generate a professional ad campaign in seconds
        </p>
      </div>

      {/* Step 1: Define Your Intent */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge step={1} />
          <h2 className="text-lg font-bold text-foreground">Define Your Intent</h2>
        </div>
        <IntentInput value={intent} onChange={setIntent} onGenerate={handleGenerate} />
      </section>

      {/* Step 2: Upload Brand Assets */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge step={2} />
          <h2 className="text-lg font-bold text-foreground">Upload Brand Assets</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <UploadZone
            title="Logo"
            helper="PNG, SVG"
            accept="image/png,image/svg+xml"
            onSelect={(files) => handleAssetSelect("logo", files)}
          />
          <UploadZone
            title="Product"
            helper="Product shots"
            accept="image/*"
            onSelect={(files) => handleAssetSelect("product", files)}
          />
          <UploadZone
            title="References"
            helper="Mood, textures, inspiration"
            accept="image/*"
            multiple
            onSelect={(files) => handleAssetSelect("reference", files)}
          />
        </div>
      </section>

      {/* Extracted Campaign Brief */}
      <CampaignBrief summary={summary} />

      {/* Step 4: Generate Creative */}
      <section className="mt-8 space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge step={4} />
          <h2 className="text-lg font-bold text-foreground">Generate Creative</h2>
        </div>

        <div className="grid gap-6">
          {DEFAULT_PLACEMENTS.map((placement) => {
            const spec = PLACEMENT_SPEC_BY_KEY[placement];
            const state = creatives[placement];
            return (
              <div
                key={placement}
                className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{spec.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {spec.width}×{spec.height} · {spec.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleGenerateCreative(placement)}
                    disabled={!briefId || state?.loading}
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    {state?.loading ? "Generating..." : "Generate Creative"}
                  </button>
                </div>

                {state?.error && (
                  <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {state.error}
                  </div>
                )}

                {state?.creative && (
                  <div className="mt-4 space-y-4">
                    <AiCreativePreview
                      html={state.creative.html}
                      title={`${spec.label} preview`}
                      className="h-72 w-full rounded-lg border border-border bg-white"
                    />
                    {state.creative.warnings && state.creative.warnings.length > 0 && (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
                        <span className="font-semibold">Warnings:</span> {state.creative.warnings.join(" • ")}
                      </div>
                    )}
                    {state.creative.assets && state.creative.assets.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Assets:</span>
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                          {state.creative.assets.map((asset, index) => (
                            <li key={`${asset.label ?? "asset"}-${index}`}>
                              {asset.label ?? "Asset"}
                              {asset.type ? ` · ${asset.type}` : ""}
                              {asset.url ? ` · ${asset.url}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
