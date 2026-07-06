"use client";

import type { AppSettings } from "@/types/orion";

export const shortcutLabels: Record<string, string> = {
  commandPalette: "Command palette",
  newChat: "New chat",
  search: "Search",
  settings: "Settings",
  exportData: "Export",
  importData: "Import",
  toggleSidebar: "Toggle sidebar",
  toggleTheme: "Theme",
  generate: "Generate",
  stop: "Stop"
};

export class ShortcutService {
  normalize(shortcuts: AppSettings["shortcuts"]) {
    return Object.fromEntries(Object.entries(shortcutLabels).map(([key]) => [key, shortcuts[key] ?? ""]));
  }
}

export const shortcutService = new ShortcutService();
