import { useEffect, useMemo, useState } from "react";
import type { PlacementSpecKey } from "@creative-store/shared";
import { CampaignBrief } from "@/components/campaign/campaign-brief";
import { IntentInput } from "@/components/campaign/intent-input";
import { StepBadge } from "@/components/campaign/step-badge";
import { UploadZone } from "@/components/campaign/upload-zone";
import { createApiClient, type ApiClient } from "@/lib/api";
import { getBriefSummary } from "@/lib/brief-summary";

const DEFAULT_PLACEMENTS: PlacementSpecKey[] = [
  "square_1_1",
  "feed_4_5",
  "story_9_16"
];

type CampaignGeneratorProps = {
  api?: ApiClient;
};

export function CampaignGenerator({ api }: CampaignGeneratorProps) {
  const apiClient = useMemo(() => api ?? createApiClient(), [api]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [intent, setIntent] = useState("");
  const [summary, setSummary] = useState(() => getBriefSummary({}));

  const uploadFiles = async (
    files: FileList | null,
    uploader: (formData: FormData) => Promise<unknown>
  ) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    await uploader(formData);
  };

  useEffect(() => {
    let mounted = true;
    apiClient
      .listProjects()
      .then((response: { projects?: Array<{ id: string }> }) => {
        if (!mounted) return;
        if (response.projects && response.projects.length > 0) {
          setProjectId(response.projects[0].id);
          return;
        }
        return apiClient
          .createProject("My First Project")
          .then((created: { project?: { id: string } }) => {
            if (!mounted) return;
            setProjectId(created.project?.id ?? null);
          });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [apiClient]);

  const handleGenerate = async () => {
    if (!projectId || intent.trim().length === 0) return;
    const created = await apiClient.createBrief(projectId, {
      intentText: intent,
      placements: DEFAULT_PLACEMENTS
    });
    const briefId = created?.brief?.id;
    if (!briefId) return;
    const briefResponse = await apiClient.getBrief(briefId);
    setSummary(getBriefSummary(briefResponse.brief ?? {}));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">AI Campaign Generator</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your intent and upload assets to generate a professional ad campaign in seconds.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge step={1} />
          <h2 className="text-lg font-semibold">Define Your Intent</h2>
        </div>
        <IntentInput value={intent} onChange={setIntent} onGenerate={handleGenerate} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge step={2} />
          <h2 className="text-lg font-semibold">Upload Brand Assets</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <UploadZone
            title="Brand Logo"
            helper="PNG, SVG up to 5MB"
            accept="image/png,image/svg+xml"
            onSelect={(files) => uploadFiles(files, apiClient.uploadLogo)}
          />
          <UploadZone
            title="Main Visuals"
            helper="Product shots, lifestyle images"
            accept="image/*"
            multiple
            onSelect={(files) => uploadFiles(files, apiClient.uploadVisuals)}
          />
        </div>
      </section>

      <CampaignBrief summary={summary} />
    </div>
  );
}
