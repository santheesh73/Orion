import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Progress({
  value,
  max = 100,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: number; max?: number }) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = (clamped / max) * 100;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${percent}%` }} />
    </div>
  );
}
