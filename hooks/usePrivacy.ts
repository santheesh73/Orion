"use client";

import { useCallback, useEffect, useState } from "react";
import { privacyService, type PrivacySnapshot } from "@/services/settings/privacy.service";

export function usePrivacy() {
  const [snapshot, setSnapshot] = useState<PrivacySnapshot | null>(null);

  const refresh = useCallback(async () => {
    setSnapshot(await privacyService.snapshot());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { snapshot, refresh };
}
