import { serve } from "@hono/node-server";
import { prisma } from "@creative-store/db";
import { auth } from "./auth";
import { createApp } from "./app";

const app = createApp({
  prisma,
  getSession: (headers) => auth.api.getSession({ headers })
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`[api] listening on :${port}`);
