import { Worker } from "bullmq";
import { redis } from "./queues";
import { handleGenerateDrafts } from "./jobs/generateDrafts";
import { handleRenderCreative } from "./jobs/renderVersion";

new Worker("generate_drafts", handleGenerateDrafts, { connection: redis });
new Worker("render_creative", handleRenderCreative, { connection: redis });

console.log("[worker] started");
