import type { Job } from "bullmq";
import { prisma } from "@creative-store/db";

// TODO: Gemini integration
export async function handleGenerateDrafts(job: Job<{ briefId: string }>) {
  const { briefId } = job.data;

  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) throw new Error(`Brief not found: ${briefId}`);

  // Placeholder drafts
  const draftJson = {
    copy: {
      title: "A new way to ship creative",
      subtitle: "Generated from intent (placeholder)",
      cta: "Learn more"
    },
    style_tags: ["brand_consistent"],
    layout: "template_basic_v1"
  };

  await prisma.draft.create({
    data: {
      briefId,
      draftJson
    }
  });

  return { ok: true };
}
