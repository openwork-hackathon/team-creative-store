import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type WalletSummary = {
  address: string;
  aiccBalance: string;
};

type WalletTx = {
  id: string;
  type: "received" | "purchase" | "failed";
  hash: string;
  amount: string;
  direction: "in" | "out";
  status: "confirmed" | "pending" | "reverted";
  createdAt: string;
};

type Order = {
  id: string;
  creativeTitle: string;
  licenseType: "standard" | "extended";
  priceAicc: string;
  status: "confirmed" | "pending" | "refunded";
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
    }
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return (await res.json()) as { orders: Order[] };
    }
  });

  const summary = summaryQuery.data?.summary;
  const transactions = txQuery.data?.transactions ?? [];
  const orders = ordersQuery.data?.orders ?? [];

  return (
    <div className="mx-auto w-full max-w-[1024px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-72 space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Wallet &amp; Orders</h1>
          <p className="text-muted-foreground">
            Manage your on-chain assets, AICC tokens, and creative licensing.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          Add Funds
        </button>
      </div>

      <div className="flex gap-8 border-b border-border/70">
        <button
          type="button"
          onClick={() => setTab("wallet")}
          className={
            tab === "wallet"
              ? "border-b-2 border-primary pb-3 pt-4 text-sm font-bold text-foreground"
              : "pb-3 pt-4 text-sm font-bold text-muted-foreground hover:text-foreground"
          }
        >
          Wallet
        </button>
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={
            tab === "orders"
              ? "border-b-2 border-primary pb-3 pt-4 text-sm font-bold text-foreground"
              : "pb-3 pt-4 text-sm font-bold text-muted-foreground hover:text-foreground"
          }
        >
          Orders
        </button>
      </div>

      {tab === "wallet" ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Base Network Address
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <div className="font-mono text-lg font-bold">
                  {summary ? summary.address : "—"}
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-primary"
                  onClick={async () => {
                    if (!summary?.address) return;
                    await navigator.clipboard.writeText(summary.address);
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AICC Balance
              </div>
              <div className="mt-2 text-lg font-bold">
                {summary ? `${summary.aiccBalance} AICC` : "—"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Transaction History</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Hash</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium">{tx.type}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {tx.hash}
                      </td>
                      <td
                        className={
                          tx.direction === "in"
                            ? "px-6 py-4 font-bold text-emerald-500"
                            : "px-6 py-4 font-bold"
                        }
                      >
                        {tx.direction === "in" ? "+" : "-"} {tx.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase">
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-muted-foreground" colSpan={5}>
                        No transactions yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Creative Orders</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Creative</th>
                  <th className="px-6 py-4">License</th>
                  <th className="px-6 py-4">Price (AICC)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 font-medium">{order.creativeTitle}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.licenseType}</td>
                    <td className="px-6 py-4 font-bold">{order.priceAicc}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-muted-foreground" colSpan={5}>
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(summaryQuery.isLoading || txQuery.isLoading || ordersQuery.isLoading) && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}
      {(summaryQuery.isError || txQuery.isError || ordersQuery.isError) && (
        <div className="text-sm text-red-500">Failed to load wallet data.</div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/wallet")({
  component: WalletPage
});
