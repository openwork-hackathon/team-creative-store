import { Worker } from "bullmq";
import { redis } from "./queues";
import { handleGenerateDrafts } from "./jobs/generateDrafts";
import { handleRenderVersion } from "./jobs/renderVersion";
import { handleMintNft } from "./jobs/mintNft";

new Worker("generate_drafts", handleGenerateDrafts, { connection: redis });
new Worker("render_version", handleRenderVersion, { connection: redis });
new Worker("mint_nft", handleMintNft, { connection: redis });

console.log("[worker] started");
