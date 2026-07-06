import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Route } from "next";

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: Route }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href ? <Link href={item.href} className="transition hover:text-foreground">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            {index < items.length - 1 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
