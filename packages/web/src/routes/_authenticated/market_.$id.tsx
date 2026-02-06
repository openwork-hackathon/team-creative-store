import { createFileRoute, useParams } from "@tanstack/react-router"
import { MarketDetailPage } from "@/pages/market-detail-page"

export const Route = createFileRoute("/_authenticated/market_/$id")({
  component: MarketDetailRoute,
})

function MarketDetailRoute() {
  const { id } = useParams({ from: "/_authenticated/market_/$id" })
  return <MarketDetailPage id={id} />
}
