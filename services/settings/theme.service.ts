"use client";

import type { AppSettings } from "@/types/orion";

const accentMap: Record<AppSettings["appearance"]["accentColor"], string> = {
  blue: "34 86 255",
  green: "21 184 111",
  violet: "124 92 255",
  rose: "225 63 102",
  amber: "226 150 35"
};

export class ThemeService {
  apply(settings: AppSettings) {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    root.style.setProperty("--primary", accentMap[settings.appearance.accentColor]);
    root.style.setProperty("--radius-md", settings.appearance.roundedCorners === "sm" ? "0.375rem" : settings.appearance.roundedCorners === "lg" ? "0.75rem" : "0.5rem");
    root.style.setProperty("--orion-font-scale", `${settings.accessibility.fontScaling}%`);
    root.style.setProperty("--orion-line-height", String(settings.accessibility.lineHeight));
    root.dataset.compact = String(settings.appearance.compactMode);
    root.dataset.highContrast = String(settings.accessibility.highContrast);
    root.dataset.reduceMotion = String(settings.accessibility.reduceMotion);
  }
}

export const themeService = new ThemeService();
