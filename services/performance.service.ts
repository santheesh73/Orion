import { formatBytes } from "@/services/ai/stream";
import { cacheService } from "@/services/cache.service";

export interface PerformanceSnapshot {
  fps: number;
  memoryUsage: string;
  memoryBytes: number | null;
  storageUsage: string;
  cacheUsage: string;
  cpuEstimate: string;
  modelLoadTimeMs: number | null;
  responseLatencyMs: number | null;
  tokensPerSecond: number | null;
}

type MemoryPerformance = Performance & {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

class RollingFps {
  private frames = 0;
  private started = performance.now();

  tick(now = performance.now()) {
    this.frames += 1;
    const elapsed = now - this.started;
    if (elapsed < 500) return null;
    const fps = Math.round((this.frames * 1000) / elapsed);
    this.frames = 0;
    this.started = now;
    return fps;
  }
}

export class PerformanceService {
  private modelLoadTimeMs: number | null = null;
  private responseLatencyMs: number | null = null;
  private tokensPerSecond: number | null = null;

  markModelLoad(ms: number) {
    this.modelLoadTimeMs = ms;
  }

  markGeneration(metrics: { latencyMs?: number | null; tokensPerSecond?: number | null }) {
    this.responseLatencyMs = metrics.latencyMs ?? this.responseLatencyMs;
    this.tokensPerSecond = metrics.tokensPerSecond ?? this.tokensPerSecond;
  }

  async snapshot(fps: number): Promise<PerformanceSnapshot> {
    const memory = (performance as MemoryPerformance).memory;
    const storage = "storage" in navigator && "estimate" in navigator.storage ? await navigator.storage.estimate() : { usage: 0, quota: 0 };
    const cache = await cacheService.snapshot();
    const cpuEstimate = fps >= 55 ? "Idle" : fps >= 35 ? "Moderate" : "Busy";

    return {
      fps,
      memoryBytes: memory?.usedJSHeapSize ?? null,
      memoryUsage: memory ? `${formatBytes(memory.usedJSHeapSize)} / ${formatBytes(memory.jsHeapSizeLimit)}` : "Unavailable",
      storageUsage: `${formatBytes(storage.usage ?? 0)} / ${formatBytes(storage.quota ?? 0)}`,
      cacheUsage: formatBytes(cache.totalSize),
      cpuEstimate,
      modelLoadTimeMs: this.modelLoadTimeMs,
      responseLatencyMs: this.responseLatencyMs,
      tokensPerSecond: this.tokensPerSecond
    };
  }

  subscribe(callback: (fps: number) => void) {
    const rolling = new RollingFps();
    let frame = 0;
    const loop = (now: number) => {
      const fps = rolling.tick(now);
      if (fps !== null) callback(fps);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }
}

export const performanceService = new PerformanceService();
