import { Bot, History, Mic, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type IntentInputProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  className?: string;
};

export function IntentInput({ value, onChange, onGenerate, className }: IntentInputProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Bot className="h-6 w-6" />
        </div>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Describe your campaign goal (e.g., 'Launch a summer sale for eco-friendly sneakers targeting Gen Z with a minimalist, high-energy aesthetic')"
          className="min-h-[140px] border-border/60 bg-transparent"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-muted-foreground">
          <button type="button" className="rounded-full p-2 transition hover:text-foreground">
            <Sparkles className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-2 transition hover:text-foreground">
            <Mic className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full p-2 transition hover:text-foreground">
            <History className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={onGenerate} className="gap-2">
          <Zap className="h-4 w-4" />
          Generate Brief
        </Button>
      </div>
    </div>
  );
}
