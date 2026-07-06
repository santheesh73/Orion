"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function ResizablePanel({
  sidebar,
  children,
  className
}: {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-h-0 grid-cols-1 overflow-hidden rounded-lg border border-border lg:grid-cols-[minmax(220px,28%)_1fr]", className)}>
      <div className="min-h-0 resize-x overflow-auto border-r border-border bg-surface p-4 scrollbar-subtle lg:min-w-56 lg:max-w-xl">
        {sidebar}
      </div>
      <div className="min-h-0 overflow-auto bg-background p-4 scrollbar-subtle">{children}</div>
    </div>
  );
}
