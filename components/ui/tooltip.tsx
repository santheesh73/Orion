"use client";

import { AnimatePresence, m } from "framer-motion";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Tooltip({ children, content, side = "top" }: { children: ReactNode; content: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <span aria-describedby={id} className="contents">{children}</span>
      <AnimatePresence>
        {open ? (
          <m.span
            id={id}
            role="tooltip"
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-medium",
              side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
              side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
              side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
              side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2"
            )}
            initial={{ opacity: 0, y: side === "top" ? 4 : side === "bottom" ? -4 : 0, x: side === "left" ? 4 : side === "right" ? -4 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: side === "top" ? 4 : side === "bottom" ? -4 : 0, x: side === "left" ? 4 : side === "right" ? -4 : 0 }}
            transition={{ duration: 0.12 }}
          >
            {content}
          </m.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
