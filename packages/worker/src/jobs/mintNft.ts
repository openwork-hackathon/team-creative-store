import type { Job } from "bullmq";
import crypto from "node:crypto";
import { prisma } from "@creative-store/db";

// TODO: Base mint integration (viem/ethers)
export async function handleMintNft(job: Job<{ versionId: string }>) {
  const { versionId } = job.data;
  const version = await prisma.creativeVersion.findUnique({ where: { id: versionId } });
  if (!version) throw new Error(`Version not found: ${versionId}`);

  const contentHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(version.sourceTree))
    .digest("hex");

  await prisma.nftRecord.upsert({
    where: { versionId },
    create: {
      versionId,
      chain: "base",
      contractAddress: "0xTODO",
      tokenId: "0",
      txHash: "0xTODO",
      metadataUri: "ipfs://TODO",
      contentHash,
      status: "pending"
    },
    update: {
      contentHash
    }
  });

  return { ok: true };
}
