import { createAuthClient } from "better-auth/react";

export const getAuthBaseUrl = () => import.meta.env.VITE_API_URL ?? "";

export const createWebAuthClient = (
  factory: typeof createAuthClient = createAuthClient
) => factory({ baseURL: getAuthBaseUrl() });

export const authClient = createWebAuthClient();
