import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits } from "viem";
import {
  ConnectWalletModal,
  ConnectedState,
  DisconnectedState,
  OrdersTabContent,
  WalletTabs,
  erc20Abi,
  type WalletTx,
  type Order
} from "../components/wallet";

export function WalletPage() {
  const [tab, setTab] = useState<"wallet" | "orders">("wallet");
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Wagmi hooks for wallet connection
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Get ETH balance on Base network
  const { data: balanceData } = useBalance({
    address,
    chainId: base.id
  });

  const aiccTokenAddress = import.meta.env.VITE_AICC_TOKEN_ADDRESS as
    | `0x${string}`
    | undefined;

  // Get AICC token balance (ERC20 on Base)
  const { data: aiccBalance } = useReadContract({
    address: aiccTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!aiccTokenAddress && !!address
    }
  });

  const { data: aiccDecimals } = useReadContract({
    address: aiccTokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: base.id,
    query: {
      enabled: !!aiccTokenAddress
    }
  });

  // Format balance
  const formattedBalance = balanceData
    ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
    : "0.00 ETH";

  const formattedAiccBalance = aiccTokenAddress && aiccBalance !== undefined && aiccDecimals !== undefined
    ? `${parseFloat(formatUnits(aiccBalance, aiccDecimals)).toFixed(2)} AICC`
    : aiccTokenAddress
      ? "0.00 AICC"
      : "Set VITE_AICC_TOKEN_ADDRESS";

  const txQuery = useQuery({
    queryKey: ["wallet", "transactions", address],
    queryFn: async () => {
      const res = await fetch("/api/wallet/transactions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load transactions");
      return (await res.json()) as { transactions: WalletTx[] };
    },
    enabled: isConnected
  });

  const ordersQuery = useQuery({
    queryKey: ["orders", address],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return (await res.json()) as { orders: Order[] };
    },
    enabled: isConnected
  });

  const transactions = txQuery.data?.transactions ?? [];
  const orders = ordersQuery.data?.orders ?? [];

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
  };

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect(
      { connector },
      {
        onSuccess: () => {
          setShowConnectModal(false);
        },
        onError: (error) => {
          console.error("Failed to connect wallet:", error);
        }
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-10">
      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <ConnectWalletModal
          connectors={connectors}
          isConnectPending={isConnectPending}
          isConnecting={isConnecting}
          onConnect={handleConnect}
          onClose={() => setShowConnectModal(false)}
        />
      )}

      {/* Page Heading */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
            Wallet &amp; Orders
          </h1>
          <p className="text-base font-normal leading-normal text-slate-500 dark:text-[#92a4c9]">
            Manage your on-chain assets, AICC tokens, and creative licensing.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <WalletTabs tab={tab} onTabChange={setTab} />

      {tab === "wallet" ? (
        isConnected && address ? (
          <ConnectedState
            address={address}
            formattedBalance={formattedBalance}
            formattedAiccBalance={formattedAiccBalance}
            transactions={transactions}
            orders={orders}
            onCopyAddress={copyAddress}
            onDisconnect={() => disconnect()}
          />
        ) : (
          <DisconnectedState onConnectClick={() => setShowConnectModal(true)} />
        )
      ) : (
        <OrdersTabContent
          isConnected={isConnected}
          orders={orders}
          onConnectClick={() => setShowConnectModal(true)}
        />
      )}

      {isConnecting && (
        <div className="text-sm text-slate-500 dark:text-[#92a4c9]">Connecting…</div>
      )}
    </div>
  );
}
