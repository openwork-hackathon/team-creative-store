import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/app-layout";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
});
