import type { WalletTx } from "./types";

type TxIconProps = {
  type: WalletTx["type"];
};

export function TxIcon({ type }: TxIconProps) {
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
}
