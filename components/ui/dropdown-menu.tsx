"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  side = "bottom"
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <span
        role="button"
        tabIndex={0}
        className="cursor-pointer inline-flex items-center"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        {trigger}
      </span>
      <AnimatePresence>
        {open ? (
          <m.div
            role="menu"
            className={cn(
              "absolute z-40 min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-floating-panel",
              side === "top" ? "bottom-full mb-2" : "top-full mt-2",
              align === "end" ? "right-0" : "left-0"
            )}
            initial={{ opacity: 0, y: side === "top" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "top" ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
          >
            {children}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn("flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition hover:bg-hover focus-visible:bg-hover", className)}
      {...props}
    />
  );
}
