import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Header({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)} {...props}>
      <div>
        {eyebrow ? <p className="mb-2 text-caption font-medium uppercase text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-heading-2">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-body text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
