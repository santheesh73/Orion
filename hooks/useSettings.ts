"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { settingsCenterService } from "@/services/settings/settings.service";
import { themeService } from "@/services/settings/theme.service";
import { useOrionStore } from "@/store/orion-store";
import type { AppSettings } from "@/types/orion";

export function useSettings() {
  const appSettings = useOrionStore((state) => state.appSettings);
  const setAppSettings = useOrionStore((state) => state.setAppSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await settingsCenterService.get();
      setAppSettings(settings);
      themeService.apply(settings);
    } finally {
      setLoading(false);
    }
  }, [setAppSettings]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(
    async (changes: Partial<AppSettings>) => {
      const settings = await settingsCenterService.update(changes);
      setAppSettings(settings);
      themeService.apply(settings);
      toast.success("Settings saved");
      return settings;
    },
    [setAppSettings]
  );

  const reset = useCallback(async () => {
    const settings = await settingsCenterService.reset();
    setAppSettings(settings);
    themeService.apply(settings);
    toast.success("Settings reset");
  }, [setAppSettings]);

  return { settings: appSettings, loading, refresh, update, reset };
}
