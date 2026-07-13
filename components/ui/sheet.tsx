"use client";

import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function Sheet({
  open,
  onOpenChange,
  title,
  side = "right",
  children,
  className
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: "left" | "right" | "top" | "bottom";
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  if (typeof document === "undefined") {
    return null;
  }

  const positions = {
    right: "inset-y-0 right-0 h-full w-full max-w-md",
    left: "inset-y-0 left-0 h-full w-full max-w-md",
    top: "inset-x-0 top-0 min-h-72",
    bottom: "inset-x-0 bottom-0 min-h-72"
  };

  const initial = {
    right: { x: 32, opacity: 0 },
    left: { x: -32, opacity: 0 },
    top: { y: -32, opacity: 0 },
    bottom: { y: 32, opacity: 0 }
  }[side];

  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <m.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn("glass fixed p-5 shadow-floating-panel", positions[side], className)}
            initial={initial}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={initial}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-heading-4">{title}</h2>
              <Button aria-label="Close sheet" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X />
              </Button>
            </div>
            <div className="mt-5">{children}</div>
          </m.aside>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
