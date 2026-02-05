import { cn } from "@/lib/utils";

type StepBadgeProps = {
  step: number;
  className?: string;
};

export function StepBadge({ step, className }: StepBadgeProps) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className
      )}
    >
      {step}
    </div>
  );
}
