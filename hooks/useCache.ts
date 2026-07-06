"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cacheService, type CacheSnapshot } from "@/services/cache.service";

export function useCache() {
  const [snapshot, setSnapshot] = useState<CacheSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSnapshot(await cacheService.snapshot());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    snapshot,
    loading,
    refresh,
    warmAppShell: async () => {
      await cacheService.warmAppShell();
      await refresh();
      toast.success("Offline app shell cached");
    },
    clearRuntimeCaches: async () => {
      await cacheService.clearRuntimeCaches();
      await refresh();
      toast.success("Runtime caches cleared");
    }
  };
}
