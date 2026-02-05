import type { Job } from "bullmq";
import crypto from "node:crypto";
import { prisma } from "@creative-store/db";
import { parseEventLogs, type Hex } from "viem";

import { getBaseClients } from "../chain/baseClient";
import { creativeProofAbi } from "../chain/creativeProofAbi";

type MintJobData = {
  versionId: string;
  /** Optional: where the metadata JSON lives (ipfs://... or https://...) */
  metadataUri?: string;
  /** Optional: recipient (defaults to deployer/owner if omitted) */
  to?: `0x${string}`;
};

function computeContentHash(sourceTree: unknown): Hex {
  // MVP: sha256 of JSON.stringify(sourceTree)
  // NOTE: JSON.stringify key order can affect this; keep sourceTree deterministic.
  const hex = crypto.createHash("sha256").update(JSON.stringify(sourceTree)).digest("hex");
  return (`0x${hex}`) as Hex;
}

export async function handleMintNft(job: Job<MintJobData>) {
  const { versionId, metadataUri } = job.data;
  const version = await prisma.creativeVersion.findUnique({ where: { id: versionId } });
  if (!version) throw new Error(`Version not found: ${versionId}`);

  const contentHash = computeContentHash(version.sourceTree);

  // Persist/update record early (so UI can show progress even if chain mint fails)
  const record = await prisma.nftRecord.upsert({
    where: { versionId },
    create: {
      versionId,
      chain: "base",
      contractAddress: process.env.CREATIVE_PROOF_CONTRACT || "",
      tokenId: "",
      txHash: "",
      metadataUri: metadataUri || "",
      contentHash,
      status: "pending"
    },
    update: {
      contentHash,
      metadataUri: metadataUri ?? undefined
    }
  });

  // If chain env isn't configured, stop after recording hash/metadata.
  // This keeps MVP D unblocked locally.
  if (!process.env.CREATIVE_PROOF_CONTRACT || !process.env.BASE_RPC_URL || !process.env.BASE_PRIVATE_KEY) {
    return {
      ok: true,
      skipped: true,
      reason: "Missing one of: CREATIVE_PROOF_CONTRACT, BASE_RPC_URL, BASE_PRIVATE_KEY",
      contentHash,
      nftRecordId: record.id
    };
  }

  const { publicClient, walletClient, account } = getBaseClients();

  const contractAddress = process.env.CREATIVE_PROOF_CONTRACT as `0x${string}`;
  const to = (job.data.to || account.address) as `0x${string}`;
  const uri = (metadataUri || process.env.DEFAULT_METADATA_URI || "") as string;

  if (!uri) throw new Error("Missing metadataUri (job.data.metadataUri or DEFAULT_METADATA_URI)");

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: creativeProofAbi,
    functionName: "mint",
    args: [to, contentHash, uri],
    account
  });

  const txHash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  // Try to extract tokenId from the Minted event
  let tokenId: string | undefined;
  try {
    const logs = parseEventLogs({ abi: creativeProofAbi, logs: receipt.logs });
    const minted = logs.find((l) => l.eventName === "Minted");
    if (minted && minted.args && "tokenId" in minted.args) tokenId = minted.args.tokenId.toString();
  } catch {
    // ignore parsing errors
  }

  await prisma.nftRecord.update({
    where: { versionId },
    data: {
      contractAddress,
      txHash,
      tokenId: tokenId || "",
      metadataUri: uri,
      contentHash,
      status: "confirmed",
      mintedAt: new Date()
    }
  });

  return { ok: true, txHash, tokenId, contractAddress, contentHash };
}
