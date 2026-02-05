import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent";
};

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-muted text-foreground",
  accent: "bg-emerald-500/20 text-emerald-200"
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
