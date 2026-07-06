import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Sidebar({
  header,
  footer,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { header?: ReactNode; footer?: ReactNode }) {
  return (
    <aside className={cn("flex h-full w-72 flex-col border-r border-border bg-background/82 backdrop-blur-xl", className)} {...props}>
      {header ? <div className="border-b border-border p-4">{header}</div> : null}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-subtle">{children}</div>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </aside>
  );
}
