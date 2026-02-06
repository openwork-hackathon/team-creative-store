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
        "group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <span className="material-symbols-outlined text-2xl">upload_file</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-[16px]">add_circle</span>
        <span className="text-xs font-semibold">Click to upload</span>
      </div>
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
