"use client";

import { Check, Download, HardDrive, Pause, Play, Power, RefreshCw, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes, formatDuration } from "@/services/ai/stream";
import type { OrionModel } from "@/types/orion";
import { cn } from "@/lib/utils/cn"; // triggering HMR

export function ModelCard({
  model,
  selected,
  progress,
  active,
  installed,
  loaded,
  onSelect,
  onLoad,
  onUnload,
  onReload,
  onPause,
  onCancel,
  onResume,
  onRetry,
  onDelete,
  onVerify,
  adminMode = false
}: {
  model: OrionModel;
  selected: boolean;
  progress: {
    status: string;
    progress: number;
    speedBytesPerSecond: number;
    etaSeconds: number | null;
    downloadedBytes: number;
    message: string;
  };
  active: boolean;
  installed: boolean;
  loaded: boolean;
  onSelect: () => void;
  onLoad: () => void;
  onUnload: () => void;
  onReload: () => void;
  onPause: () => void;
  onCancel: () => void;
  onResume: () => void;
  onRetry: () => void;
  onDelete: () => void;
  onVerify: () => void;
  adminMode?: boolean;
}) {
  const isDownloading = active && progress.status === "downloading";
  const isPaused = active && progress.status === "paused";
  const isComplete = installed || (active && progress.status === "complete");
  const isError = active && progress.status === "error";

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      selected 
        ? "border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(94,106,210,0.15)]" 
        : "border-border/50 bg-card hover:border-primary/30 hover:shadow-floating-panel"
    )}>
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
      )}
      <div className="relative z-10">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{model.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{model.description}</p>
          </div>
          {selected ? <Badge>Active</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {adminMode && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge>{model.family}</Badge>
            <Badge>{model.size}</Badge>
            <Badge>{model.contextWindow.toLocaleString()} tokens</Badge>
            <Badge>{model.vramRequiredMb.toLocaleString()} MB VRAM</Badge>
          </div>
        )}
        <div className="mt-4 space-y-2">
          <Progress value={active ? progress.progress : isComplete ? 100 : 0} />
          <div className="grid gap-1 text-xs text-muted-foreground">
            <span>{loaded ? "Loaded and ready for chat" : active ? progress.message : isComplete ? "Installed in browser cache" : "Not installed"}</span>
            {adminMode && (
              <span>
                {formatBytes(active ? progress.downloadedBytes : 0)} / {formatBytes(model.sizeBytes)} | {formatBytes(active ? progress.speedBytesPerSecond : 0)}/s | ETA{" "}
                {formatDuration(active ? progress.etaSeconds : null)}
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant={selected ? "secondary" : "outline"} onClick={onSelect}>
            <Check className="size-4" />
            Select
          </Button>
          {isDownloading ? (
            <>
              {adminMode && (
                <Button variant="outline" onClick={onPause}>
                  <Pause className="size-4" />
                  Pause
                </Button>
              )}
              <Button variant="outline" onClick={onCancel}>
                <X className="size-4" />
                Cancel
              </Button>
            </>
          ) : null}
          {isPaused ? (
            <Button onClick={onResume}>
              <Play className="size-4" />
              Resume
            </Button>
          ) : null}
          {!isDownloading && !isPaused ? (
            <Button onClick={isError ? onRetry : onLoad}>
              {isError ? <RefreshCw className="size-4" /> : installed ? <Play className="size-4" /> : <Download className="size-4" />}
              {isError ? "Retry" : installed ? "Load" : "Download"}
            </Button>
          ) : null}
          {loaded && adminMode ? (
            <>
              <Button variant="outline" onClick={onReload}>
                <RefreshCw className="size-4" />
                Reload
              </Button>
              <Button variant="outline" onClick={onUnload}>
                <Power className="size-4" />
                Unload
              </Button>
            </>
          ) : null}
          {adminMode && (
            <>
              <Button variant="outline" onClick={onVerify}>
                <RefreshCw className="size-4" />
                Verify
              </Button>
              <Button variant="ghost" onClick={onDelete}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            </>
          )}
        </div>
        {adminMode && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="size-3.5" />
            Stored by the browser runtime cache after first download.
          </div>
        )}
      </CardContent>
      </div>
    </Card>
  );
}
