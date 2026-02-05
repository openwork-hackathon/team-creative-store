type Audience = {
  ageRange?: string;
  geo?: string;
  interests?: string[];
};

type BriefJson = {
  industry?: string;
  audience?: Audience;
  keyBenefits?: string[];
  proposedHook?: string;
};

type BriefRecord = {
  intentText?: string;
  briefJson?: BriefJson;
};

function formatAudience(audience?: Audience) {
  if (!audience) return undefined;
  const parts = [audience.ageRange, audience.geo, ...(audience.interests ?? [])].filter(
    Boolean
  );
  return parts.length ? parts.join(", ") : undefined;
}

export function getBriefSummary(brief: BriefRecord) {
  const briefJson = brief.briefJson ?? {};
  return {
    industry: briefJson.industry,
    targetAudience: formatAudience(briefJson.audience),
    primaryUsp: briefJson.keyBenefits?.[0],
    proposedHook: briefJson.proposedHook ?? brief.intentText
  };
}
