import type { Order } from "./types";

type OrdersTabContentProps = {
  isConnected: boolean;
  orders: Order[];
  onConnectClick: () => void;
};

export function OrdersTabContent({ isConnected, orders, onConnectClick }: OrdersTabContentProps) {
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
          onClick={onConnectClick}
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
}
