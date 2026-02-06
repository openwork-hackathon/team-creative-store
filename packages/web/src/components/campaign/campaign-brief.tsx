import { StepBadge } from "@/components/campaign/step-badge";

type CampaignBriefSummary = {
  industry?: string;
  targetAudience?: string;
  primaryUsp?: string;
  proposedHook?: string;
};

type CampaignBriefProps = {
  summary: CampaignBriefSummary;
};

export function CampaignBrief({ summary }: CampaignBriefProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StepBadge step={3} />
          <h2 className="text-lg font-bold text-foreground">Extracted Campaign Brief</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span className="text-xs font-semibold">AI Analyzed</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Industry</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {summary.industry ?? "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Target Audience</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {summary.targetAudience ?? "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">star</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Primary USP</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {summary.primaryUsp ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg">
        <div className="border-l-2 border-primary pl-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proposed Hook</p>
          <p className="mt-2 text-sm text-foreground">
            {summary.proposedHook ?? "Add intent to generate a hook."}
          </p>
        </div>
      </div>
    </section>
  );
}
