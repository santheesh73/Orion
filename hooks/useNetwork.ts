"use client";

import { useEffect, useState } from "react";
import { networkService, type NetworkSnapshot } from "@/services/network.service";

export function useNetwork() {
  const [snapshot, setSnapshot] = useState<NetworkSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(networkService.snapshot());
    return networkService.subscribe(setSnapshot);
  }, []);

  return snapshot;
}
