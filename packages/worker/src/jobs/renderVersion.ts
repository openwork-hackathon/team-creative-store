import type { Job } from "bullmq";
import { prisma } from "@creative-store/db";

// TODO: layout engine + node-canvas/skia render
export async function handleRenderVersion(
  job: Job<{ versionId: string; placementSpecId: string }>
) {
  const { versionId, placementSpecId } = job.data;

  const renderJob = await prisma.renderJob.findFirst({
    where: { versionId, placementSpecId }
  });
  if (!renderJob) {
    // In MVP we expect render_jobs pre-created by API
    throw new Error("RenderJob row missing (create it before enqueue)");
  }

  await prisma.renderJob.update({
    where: { id: renderJob.id },
    data: { status: "running", startedAt: new Date() }
  });

  // Placeholder output
  const url = `s3://TODO/${versionId}/${placementSpecId}.png`;

  await prisma.render.create({
    data: {
      renderJobId: renderJob.id,
      url,
      width: 0,
      height: 0,
      format: "png",
      hash: "TODO"
    }
  });

  await prisma.renderJob.update({
    where: { id: renderJob.id },
    data: { status: "succeeded", finishedAt: new Date() }
  });

  return { ok: true };
}
