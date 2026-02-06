import { createFileRoute } from "@tanstack/react-router";

function DashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back.</p>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage
});
