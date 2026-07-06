import { cacheService } from "@/services/cache.service";
import { networkService, type NetworkSnapshot } from "@/services/network.service";

export interface OfflineSnapshot {
  ready: boolean;
  online: boolean;
  quality: NetworkSnapshot["quality"];
  lastCheckedAt: number;
}

export class OfflineService {
  async snapshot(): Promise<OfflineSnapshot> {
    const network = networkService.snapshot();
    const cachesAvailable = "caches" in window;
    const cacheKeys = cachesAvailable ? await caches.keys() : [];
    return {
      ready: cachesAvailable && cacheKeys.length > 0,
      online: network.online,
      quality: network.quality,
      lastCheckedAt: Date.now()
    };
  }

  async prepareOfflineMode() {
    await cacheService.warmAppShell();
    if ("storage" in navigator && "persist" in navigator.storage) {
      await navigator.storage.persist();
    }
    return this.snapshot();
  }
}

export const offlineService = new OfflineService();
