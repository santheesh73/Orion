"use client";

import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function FormField<TValues extends FieldValues>({
  name,
  label,
  error,
  register,
  children
}: {
  name: Path<TValues>;
  label: string;
  error?: FieldError;
  register?: UseFormRegister<TValues>;
  children?: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {children ?? (register ? <input className="h-10 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-focus" {...register(name)} /> : null)}
      {error ? <span className="text-caption text-error">{error.message}</span> : null}
    </label>
  );
}

export function FormMessage({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-caption text-error", className)} {...props} />;
}
