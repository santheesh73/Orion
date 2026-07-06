import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)} aria-label="Orion home">
      <span className="grid size-10 place-items-center rounded-lg bg-foreground text-background shadow-soft">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      {!compact ? (
        <span>
          <span className="block text-sm font-semibold">Orion</span>
          <span className="block text-caption text-muted-foreground">Private AI, on device</span>
        </span>
      ) : null}
    </Link>
  );
}
