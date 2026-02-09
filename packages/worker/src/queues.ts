import IORedis from "ioredis";
import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is required for worker/queues");
}

export const redis = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const queues = {
  generateDrafts: new Queue("generate_drafts", { connection: redis }),
  renderCreative: new Queue("render_creative", { connection: redis })
};
