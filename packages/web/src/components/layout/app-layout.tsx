import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { data: user } = useCurrentUser();
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNav user={user} />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
