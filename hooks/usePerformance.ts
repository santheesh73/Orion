"use client";

import { useCallback, useEffect, useState } from "react";
import { performanceService, type PerformanceSnapshot } from "@/services/performance.service";

export function usePerformance() {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);

  const refresh = useCallback(async (fps = 0) => {
    setSnapshot(await performanceService.snapshot(fps));
  }, []);

  useEffect(() => {
    void refresh(0);
    const stop = performanceService.subscribe((fps) => {
      void refresh(fps);
    });
    return () => {
      stop();
    };
  }, [refresh]);

  return { snapshot, refresh };
}
