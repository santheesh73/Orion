"use client";

import { useCallback, useEffect, useState } from "react";
import { offlineService, type OfflineSnapshot } from "@/services/offline.service";
import { networkService } from "@/services/network.service";

export function useOffline() {
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setSnapshot(await offlineService.snapshot());
  }, []);

  useEffect(() => {
    void refresh();
    return networkService.subscribe(() => void refresh());
  }, [refresh]);

  return {
    snapshot,
    refresh,
    prepareOfflineMode: async () => {
      const prepared = await offlineService.prepareOfflineMode();
      setSnapshot(prepared);
      return prepared;
    }
  };
}
