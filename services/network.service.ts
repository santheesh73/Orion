export type ConnectionQuality = "offline" | "slow" | "good" | "unknown";

export interface NetworkSnapshot {
  online: boolean;
  quality: ConnectionQuality;
  effectiveType: string;
  downlinkMbps: number | null;
  rttMs: number | null;
  saveData: boolean;
}

type NavigatorConnection = EventTarget & {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener(type: "change", listener: EventListener): void;
  removeEventListener(type: "change", listener: EventListener): void;
};

function connection() {
  return (navigator as Navigator & { connection?: NavigatorConnection; mozConnection?: NavigatorConnection; webkitConnection?: NavigatorConnection }).connection ??
    (navigator as Navigator & { mozConnection?: NavigatorConnection }).mozConnection ??
    (navigator as Navigator & { webkitConnection?: NavigatorConnection }).webkitConnection;
}

export class NetworkService {
  snapshot(): NetworkSnapshot {
    const conn = connection();
    const online = navigator.onLine;
    const effectiveType = conn?.effectiveType ?? "unknown";
    const slow = effectiveType.includes("2g") || (conn?.downlink ?? 10) < 1.5 || (conn?.rtt ?? 0) > 700;

    return {
      online,
      quality: online ? (slow ? "slow" : "good") : "offline",
      effectiveType,
      downlinkMbps: conn?.downlink ?? null,
      rttMs: conn?.rtt ?? null,
      saveData: Boolean(conn?.saveData)
    };
  }

  subscribe(callback: (snapshot: NetworkSnapshot) => void) {
    const conn = connection();
    const emit = () => callback(this.snapshot());
    window.addEventListener("online", emit);
    window.addEventListener("offline", emit);
    conn?.addEventListener("change", emit);

    return () => {
      window.removeEventListener("online", emit);
      window.removeEventListener("offline", emit);
      conn?.removeEventListener("change", emit);
    };
  }
}

export const networkService = new NetworkService();
