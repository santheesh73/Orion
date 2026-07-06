import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(orientation === "horizontal" ? "h-px w-full" : "h-full w-px", "bg-border", className)}
      {...props}
    />
  );
}
