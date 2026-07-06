"use client";

import { Check } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  ({ className, ...props }, ref) => (
    <label className={cn("relative inline-grid size-5 cursor-pointer place-items-center", className)}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span className="absolute inset-0 rounded-sm border border-input bg-background transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-disabled:bg-disabled" />
      <Check className="relative size-3.5 text-primary-foreground opacity-0 transition peer-checked:opacity-100" />
    </label>
  )
);

Checkbox.displayName = "Checkbox";
