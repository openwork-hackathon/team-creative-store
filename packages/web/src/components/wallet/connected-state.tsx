import type { WalletTx, Order } from "./types";
import { TxIcon } from "./tx-icon";
import { StatusBadge } from "./status-badge";
import { downloadImage } from "@/lib/utils";

type ConnectedStateProps = {
  address: string;
  formattedBalance: string;
  formattedAiccBalance: string;
  transactions: WalletTx[];
  orders: Order[];
  onCopyAddress: () => void;
  onDisconnect: () => void;
};

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ConnectedState({
  address,
  formattedBalance,
  formattedAiccBalance,
  transactions,
  orders,
  onCopyAddress,
  onDisconnect
}: ConnectedStateProps) {
  return (
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
              {formatAddress(address)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCopyAddress}
                className="p-1 text-primary hover:text-blue-400"
                title="Copy address"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
              <button
                type="button"
                onClick={onDisconnect}
                className="p-1 text-red-500 hover:text-red-400"
                title="Disconnect wallet"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#92a4c9]">
            Balance: {formattedBalance}
          </p>
        </div>
        <div className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-[#324467] dark:bg-background-dark/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#92a4c9]">
            <span className="material-symbols-outlined text-lg">token</span>
            <p className="text-sm font-medium uppercase leading-normal tracking-wider">
              AICC Balance
            </p>
          </div>
          <p className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {formattedAiccBalance}
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
                    <TxIcon type={tx.type} />
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
                  <td className="px-6 py-4">
                    <StatusBadge status={tx.status} />
                  </td>
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
                      onClick={() => order.imageUrl && downloadImage(order.imageUrl, `${order.creativeTitle}.png`)}
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
}
