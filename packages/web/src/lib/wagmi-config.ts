import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";

// WalletConnect project ID - should be set in environment variables for production
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "CreativeAI",
      appLogoUrl: "https://example.com/logo.png"
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "CreativeAI",
        description: "AI Creative Marketplace on Base",
        url: "https://creativeai.app",
        icons: ["https://example.com/logo.png"]
      }
    })
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  }
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
