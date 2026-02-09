import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CreativeStatus = "draft" | "published";

type PreviewToolbarProps = {
  title: string;
  onTitleChange: (title: string) => void;
  version: string;
  status: CreativeStatus;
  onSave: () => void;
  onPublish?: () => void;
  canPublish?: boolean;
  isSaving?: boolean;
  className?: string;
};

const STATUS_CONFIG: Record<
  CreativeStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-slate-500/20 text-slate-400" },
  published: { label: "Published", className: "bg-green-500/20 text-green-400" },
};

export function PreviewToolbar({
  title,
  onTitleChange,
  version,
  status,
  onSave,
  onPublish,
  canPublish = false,
  isSaving = false,
  className,
}: PreviewToolbarProps) {
  return (
    <header
      className={cn(
        "flex h-12 items-center gap-4 border-b border-solid border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-background-dark shrink-0 z-20",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent text-base font-bold focus:outline-none focus:border-b-2 focus:border-primary px-1 min-w-[200px]"
          placeholder="Untitled Creative"
        />

        <div className="h-5 w-px bg-slate-700"></div>

        {/* Status Badge */}
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold",
            STATUS_CONFIG[status].className
          )}
        >
          {STATUS_CONFIG[status].label}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Actions */}
        <Button variant="secondary" size="sm" onClick={onSave} disabled={isSaving}>
          <span className="material-symbols-outlined">{isSaving ? "hourglass_empty" : "save"}</span>
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </Button>

        {canPublish && onPublish && (
          <Button variant="primary" size="sm" onClick={onPublish} disabled={isSaving}>
            <span className="material-symbols-outlined">publish</span>
            <span>{isSaving ? "Publishing..." : "Publish"}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
