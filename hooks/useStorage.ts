"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { storageService, type StorageBreakdown } from "@/services/settings/storage.service";

const empty: StorageBreakdown = {
  totalUsage: 0,
  quota: 0,
  free: 0,
  databaseSize: 0,
  conversationSize: 0,
  documentSize: 0,
  modelSize: 0,
  cacheSize: 0
};

export function useStorage() {
  const [storage, setStorage] = useState<StorageBreakdown>(empty);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStorage(await storageService.estimate());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(action: () => Promise<void>, message: string) {
    await action();
    await refresh();
    toast.success(message);
  }

  return {
    storage,
    loading,
    refresh,
    clearCache: () => run(() => storageService.clearCache(), "Cache cleared"),
    clearConversations: () => run(() => storageService.clearConversations(), "Conversations deleted"),
    clearDocuments: () => run(() => storageService.clearDocuments(), "Documents deleted"),
    clearModelMetadata: () => run(() => storageService.clearModelMetadata(), "Model metadata cleared"),
    optimizeDatabase: () => run(() => storageService.optimizeDatabase(), "Database optimized")
  };
}
