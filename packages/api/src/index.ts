import { serve } from "@hono/node-server";
import { prisma } from "@creative-store/db";
import { auth } from "./auth";
import { createApp } from "./app";
import { createS3Storage } from "./storage";

const storage = createS3Storage({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  region: process.env.AWS_REGION ?? "us-east-1",
  bucket: process.env.AWS_S3_BUCKET ?? ""
});

const app = createApp({
  prisma,
  getSession: (headers) => auth.api.getSession({ headers }),
  storage
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`[api] listening on :${port}`);
