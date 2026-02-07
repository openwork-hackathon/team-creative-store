import { cn } from "@/lib/utils";

type IntentInputProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  className?: string;
};

export function IntentInput({ value, onChange, onGenerate, isGenerating = false, className }: IntentInputProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-2xl">smart_toy</span>
        </div>
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Describe your campaign goal (e.g., 'Launch a summer sale for eco-friendly sneakers targeting Gen Z with a minimalist, high-energy aesthetic')"
            className="min-h-[120px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Generating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Generate Brief
            </>
          )}
        </button>
      </div>
    </div>
  );
}
