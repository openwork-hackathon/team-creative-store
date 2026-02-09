import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_preview")({
  beforeLoad: async () => {
    // DEV MODE BYPASS
    if (import.meta.env.VITE_BYPASS_AUTH !== "true") {
      const { data: session } = await import("@/lib/auth-client").then(m => m.authClient).then(cb => cb.getSession());
      if (!session?.data?.user) {
        throw redirect({ to: "/login" });
      }
    }
  },
  component: () => (
    <Outlet />
  )
});
