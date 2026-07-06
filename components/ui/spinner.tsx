import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <Loader2 className={cn("size-4 animate-spin text-muted-foreground", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
