export interface CacheEntry {
  name: string;
  size: number;
  requests: number;
}

export interface CacheSnapshot {
  supported: boolean;
  totalSize: number;
  entries: CacheEntry[];
}

async function responseSize(response: Response) {
  const clone = response.clone();
  try {
    const buffer = await clone.arrayBuffer();
    return buffer.byteLength;
  } catch {
    return 0;
  }
}

export class CacheService {
  async snapshot(): Promise<CacheSnapshot> {
    if (!("caches" in window)) {
      return { supported: false, totalSize: 0, entries: [] };
    }

    const names = await caches.keys();
    const entries = await Promise.all(
      names.map(async (name) => {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        const sizes = await Promise.all(requests.map(async (request) => {
          const response = await cache.match(request);
          return response ? responseSize(response) : 0;
        }));
        return {
          name,
          requests: requests.length,
          size: sizes.reduce((total, size) => total + size, 0)
        };
      })
    );

    return {
      supported: true,
      entries,
      totalSize: entries.reduce((total, entry) => total + entry.size, 0)
    };
  }

  async clearRuntimeCaches() {
    if (!("caches" in window)) return;
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("orion-") || name.includes("workbox")).map((name) => caches.delete(name)));
  }

  async warmAppShell(paths = ["/", "/chat", "/documents", "/models", "/settings", "/performance", "/offline"]) {
    if (!("caches" in window)) return;
    const cache = await caches.open("orion-manual-shell-v1");
    await cache.addAll(paths);
  }
}

export const cacheService = new CacheService();
