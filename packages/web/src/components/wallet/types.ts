export type WalletTx = {
  id: string;
  type: "received" | "purchase" | "failed";
  label: string;
  hash: string;
  amount: string;
  direction: "in" | "out";
  status: "confirmed" | "pending" | "reverted";
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  creativeTitle: string;
  imageUrl?: string;
  licenseType: "standard" | "extended";
  priceAicc: string;
  status: "confirmed" | "pending" | "failed";
  statusMessage?: string;
  createdAt: string;
};

export const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  }
] as const;
