import { ImageUp } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  title: string;
  helper: string;
  accept?: string;
  multiple?: boolean;
  onSelect: (files: FileList | null) => void;
  className?: string;
};

export function UploadZone({
  title,
  helper,
  accept,
  multiple,
  onSelect,
  className
}: UploadZoneProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-border/70 bg-card/60 p-6 transition hover:border-primary/70",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <ImageUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-primary">Click to upload</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label={title}
        className="hidden"
        onChange={(event) => onSelect(event.target.files)}
      />
    </label>
  );
}
