import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function ScrollableArea({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-0 overflow-auto scrollbar-subtle", className)} {...props} />;
}
