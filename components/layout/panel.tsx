import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Panel({ glass = false, className, ...props }: HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5",
        glass && "glass bg-card/72",
        className
      )}
      {...props}
    />
  );
}
