"use client";

import { useCallback, useEffect, useState } from "react";
import { browserService, type BrowserSnapshot } from "@/services/browser.service";

export function useBrowser() {
  const [snapshot, setSnapshot] = useState<BrowserSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setSnapshot(await browserService.snapshot());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { snapshot, refresh, requestPersistentStorage: () => browserService.requestPersistentStorage() };
}
