export interface BrowserCapability {
  key: string;
  label: string;
  supported: boolean;
  detail: string;
}

export interface BrowserSnapshot {
  capabilities: BrowserCapability[];
  memoryLimitMb: number | null;
  userAgent: string;
  standalone: boolean;
}

function hasIndexedDb() {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

export class BrowserService {
  async snapshot(): Promise<BrowserSnapshot> {
    const webgpu = "gpu" in navigator;
    const serviceWorker = "serviceWorker" in navigator;
    const storage = "storage" in navigator && "estimate" in navigator.storage;
    const notification = "Notification" in window;
    const wasm = typeof WebAssembly !== "undefined";
    const pwa =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const persisted = "storage" in navigator && "persisted" in navigator.storage ? await navigator.storage.persisted() : false;
    const deviceMemory = "deviceMemory" in navigator ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) : null;

    return {
      capabilities: [
        { key: "webgpu", label: "WebGPU", supported: webgpu, detail: webgpu ? "Hardware acceleration available" : "Use a WebGPU-capable browser for local inference" },
        { key: "wasm", label: "WebAssembly", supported: wasm, detail: wasm ? "WASM runtime available" : "Required for local model runtimes" },
        { key: "indexeddb", label: "IndexedDB", supported: hasIndexedDb(), detail: "Chats, documents, and settings persistence" },
        { key: "service-worker", label: "Service Worker", supported: serviceWorker, detail: "App shell and static asset caching" },
        { key: "pwa", label: "Installable PWA", supported: serviceWorker, detail: pwa ? "Running in standalone mode" : "Install prompt available when browser criteria are met" },
        { key: "notifications", label: "Notifications", supported: notification, detail: notification ? Notification.permission : "Browser notifications unavailable" },
        { key: "storage", label: "Storage Estimate", supported: storage, detail: persisted ? "Persistent storage granted" : "Persistent storage not granted yet" }
      ],
      memoryLimitMb: deviceMemory ? deviceMemory * 1024 : null,
      userAgent: navigator.userAgent,
      standalone: pwa
    };
  }

  async requestPersistentStorage() {
    if (!("storage" in navigator) || !("persist" in navigator.storage)) return false;
    return navigator.storage.persist();
  }
}

export const browserService = new BrowserService();
