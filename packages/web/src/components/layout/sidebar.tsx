import { BarChart3, FolderOpen, LayoutDashboard, Palette, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Creative Studio", icon: Palette, active: true },
  { label: "Ad Manager", icon: BarChart3 },
  { label: "Assets", icon: FolderOpen },
  { label: "NFT Gallery", icon: WalletCards }
];

export function Sidebar() {
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
          return (
            <button
              key={item.label}
              type="button"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                item.active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <Button className="mt-6 w-full">New Project</Button>
    </aside>
  );
}
