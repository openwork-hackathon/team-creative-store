type WalletTabsProps = {
  tab: "wallet" | "orders";
  onTabChange: (tab: "wallet" | "orders") => void;
};

export function WalletTabs({ tab, onTabChange }: WalletTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-8 border-b border-slate-200 dark:border-[#324467]">
        <button
          type="button"
          onClick={() => onTabChange("wallet")}
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
          onClick={() => onTabChange("orders")}
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
  );
}
