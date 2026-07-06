import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid place-items-center rounded-lg border border-dashed border-border p-8 text-center", className)}>
      <div className="max-w-md">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-secondary text-muted-foreground">
          {icon ?? <Inbox className="size-5" />}
        </div>
        <h3 className="mt-4 text-heading-4">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
