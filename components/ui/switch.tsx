"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Switch = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  ({ className, ...props }, ref) => (
    <label className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center transition-transform hover:scale-105 active:scale-95 duration-200", className)}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span className="absolute inset-0 rounded-full bg-secondary transition-colors duration-300 peer-checked:bg-primary peer-checked:shadow-[0_0_15px_rgba(var(--primary),0.3)] peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-disabled:bg-disabled" />
      <span 
        className="relative ml-0.5 size-5 rounded-full bg-white shadow-soft peer-checked:translate-x-5" 
        style={{ transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
    </label>
  )
);

Switch.displayName = "Switch";
