type DisconnectedStateProps = {
  onConnectClick: () => void;
};

export function DisconnectedState({ onConnectClick }: DisconnectedStateProps) {
  return (
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
            onClick={onConnectClick}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-10 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Connect Wallet
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
}
