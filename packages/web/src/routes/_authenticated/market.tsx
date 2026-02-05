import { createFileRoute } from "@tanstack/react-router";

function MarketPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Market</h1>
      <p className="text-muted-foreground">Marketplace (coming next).</p>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/market")({
  component: MarketPage
});
