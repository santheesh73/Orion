"use client";

import { shortcutLabels, shortcutService } from "@/services/settings/shortcut.service";
import { useSettings } from "@/hooks/useSettings";

export function useKeyboard() {
  const { settings, update } = useSettings();
  const shortcuts = shortcutService.normalize(settings.shortcuts);

  function setShortcut(action: string, value: string) {
    return update({ shortcuts: { ...settings.shortcuts, [action]: value } });
  }

  return { shortcuts, labels: shortcutLabels, setShortcut };
}
