import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/app-layout";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // ============================================================
    // DEV MODE BYPASS - 開発モードバイパス
    // ============================================================
    // Purpose:  Allows testing without full Auth service setup
    // Usage:    Set VITE_BYPASS_AUTH=true when running dev server
    // Example:  VITE_BYPASS_AUTH=true bun run dev:web
    // When:     Useful for previewing features during development
    // Remove:   Delete this block before production deployment
    // ============================================================
    if (import.meta.env.VITE_BYPASS_AUTH === "true") {
      return { 
        user: { 
          id: "test-user", 
          email: "test@example.com", 
          name: "Test User" 
        } 
      };
    }
    
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
