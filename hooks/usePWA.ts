"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { pwaService, type PWASnapshot } from "@/services/pwa.service";

const empty: PWASnapshot = {
  installable: false,
  installed: false,
  platform: "browser",
  serviceWorker: "unsupported",
  updateAvailable: false
};

export function usePWA() {
  const [snapshot, setSnapshot] = useState<PWASnapshot>(empty);

  const refresh = useCallback(async () => {
    if (!pwaService) return;
    setSnapshot(await pwaService.snapshot());
  }, []);

  useEffect(() => {
    void refresh();
    return pwaService?.subscribe(() => void refresh());
  }, [refresh]);

  return {
    snapshot,
    install: async () => {
      const result = await pwaService?.install();
      if (result?.outcome === "accepted") toast.success("Orion installation started");
      if (result?.outcome === "dismissed") toast.info("Install dismissed");
      await refresh();
    },
    checkForUpdates: async () => {
      await pwaService?.checkForUpdates();
      toast.success("Checked for app updates");
      await refresh();
    },
    activateUpdate: async () => pwaService?.activateUpdate(),
    resetPWA: async () => pwaService?.reset(),
    refresh
  };
}
