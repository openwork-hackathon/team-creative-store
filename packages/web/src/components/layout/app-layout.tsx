import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { data: user } = useCurrentUser();
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-white">
      <div className="layout-container flex h-full grow flex-col">
        <TopNav user={user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
        {/* Footer */}
        <footer className="border-t border-slate-200 px-10 py-8 dark:border-[#232f48]">
          <div className="mx-auto flex max-w-[1024px] flex-col items-center justify-between gap-6 text-xs text-[#92a4c9] md:flex-row">
            <p>© 2025 CreativeAI Platform.</p>
            <div className="flex gap-6">
              <a className="hover:text-white" href="#">
                Terms of Service
              </a>
              <a className="hover:text-white" href="#">
                Security Policy
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
