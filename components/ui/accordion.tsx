"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-border rounded-lg border border-border", className)}>{children}</div>;
}

export function AccordionItem({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium transition hover:bg-hover"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open ? <div className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{children}</div> : null}
    </section>
  );
}
