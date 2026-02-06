import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { WagmiProvider } from "wagmi";
import { routeTree } from "./routeTree.gen";
import { createQueryClient } from "@/lib/query-client";
import { wagmiConfig } from "@/lib/wagmi-config";
import "./index.css";

const router = createRouter({ routeTree });
const queryClient = createQueryClient();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
}
