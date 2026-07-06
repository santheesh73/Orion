"use client";

import { useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { useSettings } from "@/hooks/useSettings";
import type { AppSettings } from "@/types/orion";

export function useTheme() {
  const nextTheme = useNextTheme();
  const { settings, update } = useSettings();

  useEffect(() => {
    nextTheme.setTheme(settings.theme);
  }, [nextTheme, settings.theme]);

  async function setTheme(theme: AppSettings["theme"]) {
    nextTheme.setTheme(theme);
    await update({ theme });
  }

  return {
    theme: settings.theme,
    resolvedTheme: nextTheme.resolvedTheme,
    setTheme
  };
}
