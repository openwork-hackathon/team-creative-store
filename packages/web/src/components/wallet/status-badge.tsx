import type { WalletTx } from "./types";

type StatusBadgeProps = {
  status: WalletTx["status"];
};

export function StatusBadge({ status }: StatusBadgeProps) {
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
}
