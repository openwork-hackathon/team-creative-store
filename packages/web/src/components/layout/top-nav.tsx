import { Bell, Search, Settings } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Project", to: "/projects" },
  { label: "Market", to: "/market" },
  { label: "Wallet", to: "/wallet" }
] as const;

type TopNavUser = {
  name?: string;
  email?: string;
  image?: string;
};

type TopNavProps = {
  user?: TopNavUser | null;
};

export function TopNav({ user }: TopNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-border/70 px-8 py-4">
      <nav className="flex items-center gap-6">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                active
                  ? "text-sm font-semibold text-foreground"
                  : "text-sm font-semibold text-muted-foreground hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="w-64 pl-9" placeholder="Search assets..." />
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground transition hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground transition hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
          {user?.image ? (
            <img src={user.image} alt="User" className="h-full w-full object-cover" />
          ) : (
            initials ?? "AI"
          )}
          {user?.email ? <span className="sr-only">{user.email}</span> : null}
        </div>
      </div>
    </header>
  );
}
