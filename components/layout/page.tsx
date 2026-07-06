import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Page({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <main className={cn("min-h-[calc(100vh-4rem)] pb-24 pt-8 lg:pb-12", className)} {...props} />;
}
