import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

export function Navbar({
  brand,
  links,
  actions,
  className
}: {
  brand: ReactNode;
  links: Array<{ href: Route; label: string }>;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("sticky top-0 z-30 border-b border-border bg-background/82 backdrop-blur-xl", className)}>
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="shrink-0">{brand}</div>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-hover hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </Container>
    </header>
  );
}
