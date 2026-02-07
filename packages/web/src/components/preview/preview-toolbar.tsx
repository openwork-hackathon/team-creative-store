import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CreativeStatus = "draft" | "published" | "purchased";

type PreviewToolbarProps = {
  title: string;
  onTitleChange: (title: string) => void;
  version: string;
  status: CreativeStatus;
  onSave: () => void;
  onPublish?: () => void;
  onPurchase?: () => void;
  canPublish?: boolean;
  canPurchase?: boolean;
  className?: string;
};

const STATUS_CONFIG: Record<
  CreativeStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-slate-500/20 text-slate-400" },
  published: { label: "Published", className: "bg-green-500/20 text-green-400" },
  purchased: { label: "Purchased", className: "bg-primary/20 text-primary" },
};

export function PreviewToolbar({
  title,
  onTitleChange,
  version,
  status,
  onSave,
  onPublish,
  onPurchase,
  canPublish = false,
  canPurchase = false,
  className,
}: PreviewToolbarProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-solid border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-background-dark shrink-0 z-20",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </Button>

        <div className="h-6 w-px bg-slate-700"></div>

        {/* Title Input */}
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-lg font-bold leading-tight tracking-tight focus:outline-none focus:border-b-2 focus:border-primary px-1"
            placeholder="Untitled Creative"
          />
        </div>

        {/* Version Badge */}
        <Badge variant="secondary" className="text-xs">
          {version}
        </Badge>

        {/* Status Badge */}
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-bold",
            STATUS_CONFIG[status].className
          )}
        >
          {STATUS_CONFIG[status].label}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Actions */}
        <Button variant="secondary" onClick={onSave}>
          <span className="material-symbols-outlined">save</span>
          <span>Save</span>
        </Button>

        {canPublish && onPublish && (
          <Button variant="primary" onClick={onPublish}>
            <span className="material-symbols-outlined">publish</span>
            <span>Publish</span>
          </Button>
        )}

        {canPurchase && onPurchase && (
          <Button variant="primary" onClick={onPurchase}>
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>Purchase</span>
          </Button>
        )}
      </div>
    </header>
  );
}
