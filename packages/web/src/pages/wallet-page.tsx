import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
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
import { aiccTokenAddress } from "@/lib/constants";
import { createApiClient } from "@/lib/api";

const api = createApiClient();

export function WalletPage() {
  const [tab, setTab] = useState<"wallet" | "orders">("wallet");
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  // Track the last synced address to avoid duplicate API calls
  const lastSyncedAddressRef = useRef<string | null>(null);

  // Wagmi hooks for wallet connection
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Get ETH balance on Base network
  const { data: balanceData } = useBalance({
    address,
    chainId: base.id
  });

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

  const formattedAiccBalance = aiccBalance !== undefined && aiccDecimals !== undefined
    ? `${parseFloat(formatUnits(aiccBalance, aiccDecimals)).toFixed(2)} AICC`
    : "0.00 AICC";

  const ordersQuery = useQuery({
    queryKey: ["orders", address],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return (await res.json()) as { orders: Order[] };
    },
    enabled: isConnected
  });

  const orders = ordersQuery.data?.orders ?? [];

  // Derive transactions from orders - each order represents a purchase transaction
  const transactions: WalletTx[] = orders.map((order) => ({
    id: order.id,
    type: "purchase" as const,
    label: `Purchase: ${order.creativeTitle}`,
    hash: order.txHash ? `${order.txHash.slice(0, 6)}...${order.txHash.slice(-4)}` : "Pending",
    amount: `${order.priceAicc} AICC`,
    direction: "out" as const,
    status: order.status === "confirmed" ? "confirmed" as const : order.status === "failed" ? "reverted" as const : "pending" as const,
    createdAt: order.createdAt
  }));

  // Sync wallet address to backend when connected
  useEffect(() => {
    if (isConnected && address && address !== lastSyncedAddressRef.current) {
      lastSyncedAddressRef.current = address;
      api.updateUserWallet(address).catch((error) => {
        console.error("Failed to sync wallet address:", error);
        // Reset ref so it can retry on next render
        lastSyncedAddressRef.current = null;
      });
    }
  }, [isConnected, address]);

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
