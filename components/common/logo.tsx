import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LogoIcon({ className, size = 42 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <ellipse cx="50" cy="50" rx="26" ry="35" fill="none" stroke="currentColor" strokeWidth="14" />
      <ellipse cx="50" cy="50" rx="46" ry="14" transform="rotate(-30 50 50)" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="89.8" cy="27" r="5" fill="currentColor" />
      <circle cx="10.2" cy="73" r="5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)} aria-label="Orion home">
      <LogoIcon className="shrink-0" />
      {!compact ? (
        <span>
          <span className="block text-sm font-semibold">Orion</span>
          <span className="block text-caption text-muted-foreground">Private AI, on device</span>
        </span>
      ) : null}
    </Link>
  );
}

