import type { Connector } from "wagmi";

type ConnectWalletModalProps = {
  connectors: readonly Connector[];
  isConnectPending: boolean;
  isConnecting: boolean;
  onConnect: (connector: Connector) => void;
  onClose: () => void;
};

export function ConnectWalletModal({
  connectors,
  isConnectPending,
  isConnecting,
  onConnect,
  onClose
}: ConnectWalletModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#324467] dark:bg-background-dark">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connect Wallet</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#324467] dark:hover:text-white"
          >
            <span className="material-symbols-outlined block leading-none">close</span>
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-500 dark:text-[#92a4c9]">
          Connect your wallet to access your AICC tokens, view transaction history, and manage your
          creative licenses on the Base network.
        </p>

        <div className="space-y-3">
          {connectors
            .filter((connector) => connector.name.toLowerCase().includes("coinbase"))
            .map((connector) => (
              <button
                key={connector.uid}
                type="button"
                onClick={() => onConnect(connector)}
                disabled={isConnectPending || isConnecting}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#324467] dark:bg-[#1a2333] dark:hover:border-primary dark:hover:bg-primary/10"
              >
                <span className="text-2xl">🔵</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">{connector.name}</p>
                  <p className="text-xs text-slate-500 dark:text-[#92a4c9]">Coinbase Wallet</p>
                </div>
                {(isConnectPending || isConnecting) && (
                  <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </button>
            ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-[#92a4c9]">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
