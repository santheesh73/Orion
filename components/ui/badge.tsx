import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        primary: "border-primary/20 bg-primary/10 text-primary",
        accent: "border-accent/20 bg-accent/10 text-accent",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        error: "border-error/20 bg-error/10 text-error",
        outline: "border-border bg-transparent text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}
