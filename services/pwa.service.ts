import { cacheService } from "@/services/cache.service";

export type InstallPlatform = "desktop" | "android" | "ios" | "browser";

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface PWASnapshot {
  installable: boolean;
  installed: boolean;
  platform: InstallPlatform;
  serviceWorker: "unsupported" | "installing" | "active" | "waiting" | "ready";
  updateAvailable: boolean;
}

export class PWAService extends EventTarget {
  private promptEvent: BeforeInstallPromptEvent | null = null;
  private updateRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    super();
    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        this.promptEvent = event as BeforeInstallPromptEvent;
        this.dispatchEvent(new Event("change"));
      });
      window.addEventListener("appinstalled", () => {
        this.promptEvent = null;
        this.dispatchEvent(new Event("change"));
      });
    }
  }

  async snapshot(): Promise<PWASnapshot> {
    const registration = "serviceWorker" in navigator ? await this.registration() : undefined;
    this.updateRegistration = registration ?? null;
    return {
      installable: Boolean(this.promptEvent),
      installed: this.isInstalled(),
      platform: this.platform(),
      serviceWorker: this.serviceWorkerState(registration),
      updateAvailable: Boolean(registration?.waiting)
    };
  }

  async install() {
    if (!this.promptEvent) return { outcome: "dismissed" as const, platform: "" };
    await this.promptEvent.prompt();
    const choice = await this.promptEvent.userChoice;
    this.promptEvent = null;
    this.dispatchEvent(new Event("change"));
    return choice;
  }

  async checkForUpdates() {
    const registration = await this.registration();
    await registration?.update();
    this.updateRegistration = registration ?? null;
    this.dispatchEvent(new Event("change"));
  }

  async activateUpdate() {
    const waiting = this.updateRegistration?.waiting;
    if (!waiting) return;
    waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }

  async reset() {
    await cacheService.clearRuntimeCaches();
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.unregister();
    window.location.reload();
  }

  subscribe(callback: () => void) {
    this.addEventListener("change", callback);
    navigator.serviceWorker?.addEventListener("controllerchange", callback);
    return () => {
      this.removeEventListener("change", callback);
      navigator.serviceWorker?.removeEventListener("controllerchange", callback);
    };
  }

  private isInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  }

  private platform(): InstallPlatform {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    if (/windows|macintosh|linux|cros/.test(ua)) return "desktop";
    return "browser";
  }

  private serviceWorkerState(registration?: ServiceWorkerRegistration): PWASnapshot["serviceWorker"] {
    if (!("serviceWorker" in navigator)) return "unsupported";
    if (registration?.waiting) return "waiting";
    if (registration?.installing) return "installing";
    if (registration?.active) return "active";
    return "ready";
  }

  private async registration() {
    if (!("serviceWorker" in navigator)) return undefined;
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;
    try {
      return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    } catch {
      return undefined;
    }
  }
}

export const pwaService = typeof window === "undefined" ? null : new PWAService();
