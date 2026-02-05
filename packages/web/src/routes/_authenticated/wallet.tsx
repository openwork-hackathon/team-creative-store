import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type WalletSummary = {
  address: string;
  aiccBalance: string;
  isConnected: boolean;
};

type WalletTx = {
  id: string;
  type: "received" | "purchase" | "failed";
  label: string;
  hash: string;
  amount: string;
  direction: "in" | "out";
  status: "confirmed" | "pending" | "reverted";
  createdAt: string;
};

type Order = {
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

function WalletPage() {
  const [tab, setTab] = useState<"wallet" | "orders">("wallet");

  const summaryQuery = useQuery({
    queryKey: ["wallet", "summary"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/summary", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load wallet summary");
      return (await res.json()) as { summary: WalletSummary };
    }
  });

  const txQuery = useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/transactions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load transactions");
      return (await res.json()) as { transactions: WalletTx[] };
    },
    enabled: summaryQuery.data?.summary?.isConnected ?? false
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return (await res.json()) as { orders: Order[] };
    },
    enabled: summaryQuery.data?.summary?.isConnected ?? false
  });

  const summary = summaryQuery.data?.summary;
  const isConnected = summary?.isConnected ?? false;
  const transactions = txQuery.data?.transactions ?? [];
  const orders = ordersQuery.data?.orders ?? [];

  const copyAddress = async () => {
    if (!summary?.address) return;
    await navigator.clipboard.writeText(summary.address);
  };

  const getTxIcon = (type: WalletTx["type"]) => {
    switch (type) {
      case "received":
        return (
          <div className="flex size-8 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <span className="material-symbols-outlined text-base">arrow_downward</span>
          </div>
        );
      case "purchase":
        return (
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-base">shopping_cart</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex size-8 items-center justify-center rounded-full bg-red-500/20 text-red-500">
            <span className="material-symbols-outlined text-base">priority_high</span>
          </div>
        );
    }
  };

  const getStatusBadge = (status: WalletTx["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase text-green-500">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-bold uppercase text-yellow-500">
            Pending
          </span>
        );
      case "reverted":
        return (
          <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase text-red-500">
            Reverted
          </span>
        );
    }
  };

  // Disconnected State UI
  const DisconnectedState = () => (
    <>
      {/* Blurred Wallet Overview Cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324467] dark:bg-background-dark/50">
          <div className="pointer-events-none select-none opacity-50 blur-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-[#92a4c9]">
              <span className="material-symbols-outlined text-lg">link</span>
              <p className="text-sm font-medium uppercase leading-normal tracking-wider">
                Base Network Address
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                0x000...0000
              </p>
            </div>
          </div>
        </div>
        <div className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324467] dark:bg-background-dark/50">
          <div className="pointer-events-none select-none opacity-50 blur-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-[#92a4c9]">
              <span className="material-symbols-outlined text-lg">token</span>
              <p className="text-sm font-medium uppercase leading-normal tracking-wider">
                AICC Balance
              </p>
            </div>
            <p className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              0.00 AICC
            </p>
          </div>
        </div>
      </div>

      {/* Connect Wallet CTA */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center dark:border-[#324467] dark:bg-background-dark/30">
        <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-slate-100 dark:bg-primary/10">
          <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-primary">
            link_off
          </span>
        </div>
        <h3 className="mb-4 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
          Connect Your Wallet to View Assets
        </h3>
        <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-slate-500 dark:text-[#92a4c9]">
          A connection to the Base network is required to manage your AICC tokens, view transaction
          history, and access your creative licenses and order details.
        </p>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <button
            type="button"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-10 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Connect Wallet
          </button>
          <button
            type="button"
            className="flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-8 text-lg font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-[#324467] dark:text-white dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined">swap_horiz</span>
            Switch to Base
          </button>
        </div>
      </div>

      {/* Empty Transaction History */}
      <div className="mt-16 grid grid-cols-1 gap-12">
        <div>
          <div className="mb-8 flex items-center justify-between border-b border-slate-200 px-2 pb-5 dark:border-[#324467]">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
              Transaction History
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">history</span>
            <p className="font-medium text-slate-500 dark:text-[#92a4c9]">
              No transaction history available. Connect your wallet to sync on-chain data.
            </p>
          </div>
        </div>
        <div>
          <div className="mb-8 flex items-center justify-between border-b border-slate-200 px-2 pb-5 dark:border-[#324467]">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
              Recent Creative Orders
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">
              receipt_long
            </span>
            <p className="font-medium text-slate-500 dark:text-[#92a4c9]">
              Recent orders will appear here once your wallet is linked.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Connected State UI
  const ConnectedState = () => (
    <>
      {/* Wallet Overview */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-1 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324467] dark:bg-background-dark/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#92a4c9]">
            <span className="material-symbols-outlined text-lg">link</span>
            <p className="text-sm font-medium uppercase leading-normal tracking-wider">
              Base Network Address
            </p>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {summary?.address ?? "—"}
            </p>
            <button
              type="button"
              onClick={copyAddress}
              className="p-1 text-primary hover:text-blue-400"
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </div>
        <div className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324467] dark:bg-background-dark/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#92a4c9]">
            <span className="material-symbols-outlined text-lg">token</span>
            <p className="text-sm font-medium uppercase leading-normal tracking-wider">
              AICC Balance
            </p>
          </div>
          <p className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {summary?.aiccBalance ?? "0.00"} AICC
          </p>
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">currency_exchange</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mb-12">
        <div className="flex items-center justify-between px-2 pb-5">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <button type="button" className="text-sm font-bold text-primary hover:underline">
            View All
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#324467] dark:bg-background-dark/20">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-[#1a2333] dark:text-[#92a4c9]">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Hash</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#324467]">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <td className="flex items-center gap-3 px-6 py-4">
                    {getTxIcon(tx.type)}
                    <span className="font-medium">{tx.label}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{tx.hash}</td>
                  <td
                    className={
                      tx.direction === "in"
                        ? "px-6 py-4 font-bold text-green-500"
                        : tx.status === "reverted"
                          ? "px-6 py-4 font-bold text-red-400"
                          : "px-6 py-4 font-bold"
                    }
                  >
                    {tx.direction === "in" ? "+" : "-"} {tx.amount}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-[#92a4c9]">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-slate-500 dark:text-[#92a4c9]" colSpan={5}>
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Creative Orders Preview */}
      <div className="mb-12">
        <div className="flex items-center justify-between px-2 pb-5">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
            Recent Creative Orders
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {orders.slice(0, 2).map((order) => (
            <div
              key={order.id}
              className={`flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#324467] dark:bg-background-dark/20 sm:flex-row ${order.status === "failed" ? "opacity-80" : ""}`}
            >
              {order.imageUrl ? (
                <div
                  className="size-20 shrink-0 rounded-lg border border-slate-200 bg-cover bg-center dark:border-slate-700"
                  style={{ backgroundImage: `url('${order.imageUrl}')` }}
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-3xl text-slate-400">
                    image_not_supported
                  </span>
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg font-bold">{order.creativeTitle}</h4>
                <p className="text-sm text-slate-500 dark:text-[#92a4c9]">
                  Order #{order.orderNumber} •{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={`size-2 rounded-full ${order.status === "confirmed" ? "bg-green-500" : order.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`}
                  />
                  <span
                    className={`text-xs font-bold uppercase ${order.status === "confirmed" ? "text-green-500" : order.status === "failed" ? "text-red-500" : "text-yellow-500"}`}
                  >
                    {order.statusMessage ||
                      (order.status === "confirmed"
                        ? "Payment Successful"
                        : order.status === "failed"
                          ? "Payment Failed"
                          : "Pending")}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                {order.status === "confirmed" ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Download
                    </button>
                    <button
                      type="button"
                      className="text-sm text-slate-500 underline hover:text-white"
                    >
                      View License
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-200 px-6 py-2 font-bold text-slate-600 transition-colors hover:bg-primary hover:text-white dark:bg-[#232f48] dark:text-white"
                    >
                      Retry Payment
                    </button>
                    <button
                      type="button"
                      className="text-sm text-slate-500 underline hover:text-white"
                    >
                      Contact Support
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-[#324467] dark:bg-background-dark/20 dark:text-[#92a4c9]">
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Orders Tab Content
  const OrdersTabContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center dark:border-[#324467] dark:bg-background-dark/30">
          <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-slate-100 dark:bg-primary/10">
            <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-primary">
              link_off
            </span>
          </div>
          <h3 className="mb-4 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Connect Your Wallet to View Orders
          </h3>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-slate-500 dark:text-[#92a4c9]">
            A connection to the Base network is required to view your creative orders and licenses.
          </p>
          <button
            type="button"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-10 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Connect Wallet
          </button>
        </div>
      );
    }

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between px-2 pb-5">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
            Recent Creative Orders
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#324467] dark:bg-background-dark/20 sm:flex-row ${order.status === "failed" ? "opacity-80" : ""}`}
            >
              {order.imageUrl ? (
                <div
                  className="size-20 shrink-0 rounded-lg border border-slate-200 bg-cover bg-center dark:border-slate-700"
                  style={{ backgroundImage: `url('${order.imageUrl}')` }}
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                  <span className="material-symbols-outlined text-3xl text-slate-400">
                    image_not_supported
                  </span>
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg font-bold">{order.creativeTitle}</h4>
                <p className="text-sm text-slate-500 dark:text-[#92a4c9]">
                  Order #{order.orderNumber} •{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={`size-2 rounded-full ${order.status === "confirmed" ? "bg-green-500" : order.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`}
                  />
                  <span
                    className={`text-xs font-bold uppercase ${order.status === "confirmed" ? "text-green-500" : order.status === "failed" ? "text-red-500" : "text-yellow-500"}`}
                  >
                    {order.statusMessage ||
                      (order.status === "confirmed"
                        ? "Payment Successful"
                        : order.status === "failed"
                          ? "Payment Failed"
                          : "Pending")}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                {order.status === "confirmed" ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Download
                    </button>
                    <button
                      type="button"
                      className="text-sm text-slate-500 underline hover:text-white"
                    >
                      View License
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-200 px-6 py-2 font-bold text-slate-600 transition-colors hover:bg-primary hover:text-white dark:bg-[#232f48] dark:text-white"
                    >
                      Retry Payment
                    </button>
                    <button
                      type="button"
                      className="text-sm text-slate-500 underline hover:text-white"
                    >
                      Contact Support
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-[#324467] dark:bg-background-dark/20 dark:text-[#92a4c9]">
              No orders yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1024px] px-4 py-8">
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
        {isConnected && (
          <div className="flex gap-3">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white transition-colors hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-xl">add_card</span>
              Add Funds
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-8 border-b border-slate-200 dark:border-[#324467]">
          <button
            type="button"
            onClick={() => setTab("wallet")}
            className={
              tab === "wallet"
                ? "flex flex-col items-center justify-center border-b-[3px] border-b-primary px-2 pb-3 pt-4 text-slate-900 dark:text-white"
                : "flex flex-col items-center justify-center border-b-[3px] border-b-transparent px-2 pb-3 pt-4 text-slate-400 transition-all hover:text-slate-600 dark:text-[#92a4c9] dark:hover:text-white"
            }
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Wallet</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={
              tab === "orders"
                ? "flex flex-col items-center justify-center border-b-[3px] border-b-primary px-2 pb-3 pt-4 text-slate-900 dark:text-white"
                : "flex flex-col items-center justify-center border-b-[3px] border-b-transparent px-2 pb-3 pt-4 text-slate-400 transition-all hover:text-slate-600 dark:text-[#92a4c9] dark:hover:text-white"
            }
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Orders</p>
            </div>
          </button>
        </div>
      </div>

      {tab === "wallet" ? (
        isConnected ? (
          <ConnectedState />
        ) : (
          <DisconnectedState />
        )
      ) : (
        <OrdersTabContent />
      )}

      {summaryQuery.isLoading && (
        <div className="text-sm text-slate-500 dark:text-[#92a4c9]">Loading…</div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/wallet")({
  component: WalletPage
});
