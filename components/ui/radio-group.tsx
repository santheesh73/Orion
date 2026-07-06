"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const RadioContext = createContext<{ name: string; value: string; onChange: (value: string) => void } | null>(null);

export function RadioGroup({
  name,
  value,
  onValueChange,
  children,
  className
}: {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadioContext.Provider value={{ name, value, onChange: onValueChange }}>
      <div role="radiogroup" className={cn("grid gap-2", className)}>{children}</div>
    </RadioContext.Provider>
  );
}

export function RadioItem({ value, children }: { value: string; children: ReactNode }) {
  const context = useContext(RadioContext);
  if (!context) throw new Error("RadioItem must be used inside RadioGroup");

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="radio"
        name={context.name}
        value={value}
        checked={context.value === value}
        onChange={() => context.onChange(value)}
        className="size-4 accent-primary focus-visible:ring-focus"
      />
      {children}
    </label>
  );
}
