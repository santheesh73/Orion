import type { HTMLAttributes } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils/cn";

export function Avatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full bg-secondary", className)} {...props} />;
}

export function AvatarImage({ className, alt, ...props }: ImageProps) {
  return <Image alt={alt} className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("grid size-full place-items-center text-sm font-medium text-muted-foreground", className)} {...props} />;
}
