import type { HTMLAttributes } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

export function Footer({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t border-border py-6 text-sm text-muted-foreground", className)} {...props}>
      <Container>{children}</Container>
    </footer>
  );
}
