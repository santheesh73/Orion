"use client";

import { Activity, Cpu, Database, Gauge, HardDrive, MemoryStick, Timer, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBrowser } from "@/hooks/useBrowser";
import { useCache } from "@/hooks/useCache";
import { useNetwork } from "@/hooks/useNetwork";
import { useOffline } from "@/hooks/useOffline";
import { usePerformance } from "@/hooks/usePerformance";
import { usePWA } from "@/hooks/usePWA";
import { formatBytes } from "@/services/ai/stream";

function Metric({ icon: Icon, label, value, tone = "default" }: { icon: ComponentType<{ className?: string }>; label: string; value: string; tone?: "default" | "success" | "warning" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-secondary text-foreground">
          <Icon className="size-5" />
        </div>
        <Badge variant={tone}>{tone === "success" ? "Healthy" : tone === "warning" ? "Review" : "Live"}</Badge>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-lg font-semibold">{value}</p>
    </div>
  );
}

export function PerformanceDashboard() {
  const perf = usePerformance();
  const browser = useBrowser();
  const network = useNetwork();
  const cache = useCache();
  const offline = useOffline();
  const pwa = usePWA();
  const fps = perf.snapshot?.fps ?? 0;
  const cacheTotal = cache.snapshot?.totalSize ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6 lg:pb-10">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-heading-2">Performance</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Browser-native health for Orion&apos;s offline shell, install state, cache, storage, and local AI responsiveness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void offline.prepareOfflineMode()}>
            <Database />
            Cache shell
          </Button>
          <Button type="button" variant="outline" onClick={() => void pwa.checkForUpdates()}>
            <Gauge />
            Check updates
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Activity} label="FPS" value={`${fps || "Calculating"}`} tone={fps >= 45 ? "success" : fps ? "warning" : "default"} />
        <Metric icon={MemoryStick} label="Memory usage" value={perf.snapshot?.memoryUsage ?? "Checking"} />
        <Metric icon={HardDrive} label="Storage usage" value={perf.snapshot?.storageUsage ?? "Checking"} />
        <Metric icon={Database} label="Cache usage" value={perf.snapshot?.cacheUsage ?? "Checking"} />
        <Metric icon={Cpu} label="CPU estimate" value={perf.snapshot?.cpuEstimate ?? "Checking"} />
        <Metric icon={Timer} label="Response latency" value={perf.snapshot?.responseLatencyMs ? `${Math.round(perf.snapshot.responseLatencyMs)} ms` : "No generation yet"} />
        <Metric icon={Zap} label="Tokens per second" value={perf.snapshot?.tokensPerSecond ? perf.snapshot.tokensPerSecond.toFixed(1) : "No generation yet"} />
        <Metric icon={Gauge} label="Model load time" value={perf.snapshot?.modelLoadTimeMs ? `${Math.round(perf.snapshot.modelLoadTimeMs)} ms` : "No load recorded"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading-4">Browser Capabilities</h2>
            <Badge variant={browser.snapshot?.standalone ? "success" : "default"}>{browser.snapshot?.standalone ? "Standalone" : "Browser"}</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {browser.snapshot?.capabilities.map((capability) => (
              <div key={capability.key} className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                <p className="text-sm font-medium">{capability.label}</p>
                <p className="text-xs leading-5 text-muted-foreground">{capability.detail}</p>
                <Badge variant={capability.supported ? "success" : "warning"}>{capability.supported ? "Ready" : "Unavailable"}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <h2 className="text-heading-4">Offline Cache</h2>
          <div className="mt-4 rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>Offline shell</span>
              <Badge variant={offline.snapshot?.ready ? "success" : "warning"}>{offline.snapshot?.ready ? "Prepared" : "Pending"}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span>Network</span>
              <Badge variant={network?.online ? "success" : "warning"}>{network?.online ? network.quality : "offline"}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span>Service worker</span>
              <Badge>{pwa.snapshot.serviceWorker}</Badge>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {cache.snapshot?.entries.map((entry) => (
              <div key={entry.name} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="break-all font-medium">{entry.name}</span>
                  <span className="text-muted-foreground">{formatBytes(entry.size)}</span>
                </div>
                <Progress className="mt-2" value={cacheTotal > 0 ? (entry.size / cacheTotal) * 100 : 0} />
                <p className="mt-2 text-xs text-muted-foreground">{entry.requests} cached requests</p>
              </div>
            ))}
            {!cache.loading && !cache.snapshot?.entries.length ? <p className="text-sm text-muted-foreground">No runtime caches found yet.</p> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void cache.warmAppShell()}>Warm cache</Button>
            <Button type="button" variant="destructive" onClick={() => void cache.clearRuntimeCaches()}>Clear cache</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
