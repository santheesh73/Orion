import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { m } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        primary: "border-primary/20 bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]",
        accent: "border-accent/20 bg-accent/10 text-accent",
        success: "border-success/20 bg-success/10 text-success shadow-[0_0_10px_rgba(var(--success),0.2)]",
        warning: "border-warning/20 bg-warning/10 text-warning shadow-[0_0_10px_rgba(var(--warning),0.2)]",
        error: "border-error/20 bg-error/10 text-error shadow-[0_0_10px_rgba(var(--error),0.2)]",
        outline: "border-border bg-transparent text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function Badge({ className, variant, pulse, ...props }: BadgeProps) {
  if (pulse) {
    return (
      <m.span
        animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}
