import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "@/pages/market-page";

export const Route = createFileRoute("/_authenticated/market")({
  component: MarketPage
});
