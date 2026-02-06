import { LayoutDashboard, Layers, Store, Sparkles, WalletCards } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Project", icon: Layers, to: "/projects" },
  { label: "Market", icon: Store, to: "/market" },
  { label: "Wallet", icon: WalletCards, to: "/wallet" }
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-border/70 bg-card/80 px-5 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Creative AI</p>
          <p className="text-xs text-muted-foreground">Pro Plan</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                active
                  ? "flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-2 text-sm font-medium text-primary"
                  : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Button className="mt-6 w-full">New Project</Button>
    </aside>
  );
}
