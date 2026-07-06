import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle
};

const variants = {
  info: "border-primary/25 bg-primary/10 text-primary",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  error: "border-error/25 bg-error/10 text-error"
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants; title: string }) {
  const Icon = icons[variant];
  return (
    <div role="status" className={cn("flex gap-3 rounded-lg border p-4", variants[variant], className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 text-sm leading-6 text-foreground/80">{children}</div>
      </div>
    </div>
  );
}
