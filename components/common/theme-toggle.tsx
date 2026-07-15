"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-mounted";
import { AnimatePresence, m } from "framer-motion";

export function ThemeToggle({ side = "bottom", align }: { side?: "top" | "bottom"; align?: "start" | "end" }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip content={`Switch to ${isDark ? "light" : "dark"} theme`} side={side === "top" ? "top" : "bottom"}>
      <Button
        aria-label="Toggle theme"
        variant="ghost"
        size="icon"
        className="relative overflow-hidden"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.div
            key={isDark ? "dark" : "light"}
            initial={{ opacity: 0, scale: 0.5, rotate: isDark ? -90 : 90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: isDark ? 90 : -90 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </m.div>
        </AnimatePresence>
      </Button>
    </Tooltip>
  );
}
