import { Activity, Cpu, WifiOff, HardDrive, Clock, Box } from "lucide-react";
import { formatBytes } from "@/services/ai/stream";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/tooltip";

interface StatusBarProps {
  backend: string;
  loadedModelId: string | null;
  memoryUsageMb: number | null;
  tokensPerSecond: number;
  latencyMs: number | null;
  contextWindow: number;
}

export function StatusBar({ backend, loadedModelId, memoryUsageMb, tokensPerSecond, latencyMs, contextWindow }: StatusBarProps) {
  return (
    <div className="flex w-full items-center justify-between border-t border-border/40 bg-surface/30 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-md">
      <div className="flex items-center gap-4 hidden sm:flex">
        <StatusItem
          icon={<Cpu className="size-3.5" />}
          label="Backend"
          value={backend === "webgpu" ? "WebGPU" : backend}
          active={backend === "webgpu"}
        />
        <StatusItem
          icon={<WifiOff className="size-3.5" />}
          label="Network"
          value="Offline Ready"
          active={true}
        />
        <StatusItem
          icon={<Box className="size-3.5" />}
          label="Model"
          value={loadedModelId ? "Loaded" : "Unloaded"}
          active={!!loadedModelId}
        />
      </div>

      <div className="flex items-center gap-4">
        <Tooltip content="Tokens per second">
          <div className="flex items-center gap-1.5 cursor-help">
            <Activity className="size-3.5 text-primary" />
            <span>{tokensPerSecond > 0 ? tokensPerSecond.toFixed(1) : "--"} t/s</span>
          </div>
        </Tooltip>

        <Tooltip content="VRAM Usage">
          <div className="flex items-center gap-1.5 cursor-help">
            <HardDrive className="size-3.5 text-accent" />
            <span>{memoryUsageMb ? `${memoryUsageMb} MB` : "-- MB"}</span>
          </div>
        </Tooltip>

        <Tooltip content="Time to first token">
          <div className="flex items-center gap-1.5 cursor-help">
            <Clock className="size-3.5 text-warning" />
            <span>{latencyMs ? `${latencyMs}ms` : "-- ms"}</span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

function StatusItem({ icon, label, value, active }: { icon: React.ReactNode; label: string; value: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className={cn("relative flex h-2 w-2")}>
        {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", active ? "bg-success" : "bg-muted-foreground/30")}></span>
      </span>
      <span>{value}</span>
    </div>
  );
}
