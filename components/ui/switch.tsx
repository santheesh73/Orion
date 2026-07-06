"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Switch = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  ({ className, ...props }, ref) => (
    <label className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center", className)}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span className="absolute inset-0 rounded-full bg-secondary transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-disabled:bg-disabled" />
      <span className="relative ml-0.5 size-5 rounded-full bg-white shadow-soft transition peer-checked:translate-x-5" />
    </label>
  )
);

Switch.displayName = "Switch";
