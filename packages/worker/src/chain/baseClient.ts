import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

function getChain() {
  const chainName = (process.env.BASE_CHAIN || "base").toLowerCase();
  if (chainName === "base-sepolia" || chainName === "sepolia") return baseSepolia;
  return base;
}

export function getBaseClients() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) throw new Error("Missing BASE_RPC_URL");

  const chain = getChain();
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({ chain, transport });

  const pk = process.env.BASE_PRIVATE_KEY as `0x${string}` | undefined;
  if (!pk) throw new Error("Missing BASE_PRIVATE_KEY");

  const account = privateKeyToAccount(pk);
  const walletClient = createWalletClient({ chain, transport, account });

  return { chain, publicClient, walletClient, account };
}
