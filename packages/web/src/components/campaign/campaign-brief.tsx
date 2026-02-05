import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StepBadge } from "@/components/campaign/step-badge";
import { Building2, ShieldCheck, Star, Users } from "lucide-react";

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
          <h2 className="text-lg font-semibold">Extracted Campaign Brief</h2>
        </div>
        <Badge variant="accent">
          <ShieldCheck className="h-3.5 w-3.5" />
          AI Analyzed
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Industry</p>
              <p className="text-sm font-semibold text-foreground">
                {summary.industry ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Target Audience</p>
              <p className="text-sm font-semibold text-foreground">
                {summary.targetAudience ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Primary USP</p>
              <p className="text-sm font-semibold text-foreground">
                {summary.primaryUsp ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="border-l-2 border-primary/70 py-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Proposed Hook</p>
          <p className="mt-2 text-sm text-foreground">
            {summary.proposedHook ?? "Add intent to generate a hook."}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
