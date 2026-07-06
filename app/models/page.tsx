"use client";

import { ORION_MODELS } from "@/lib/constants/models";
import { ModelCard } from "@/components/models/model-card";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/services/ai/stream";
import { useAI } from "@/hooks/useAI";

import { useOrionStore } from "@/store/orion-store";

export default function ModelsPage() {
  const adminMode = useOrionStore((state) => state.appSettings.adminMode);
  const {
    selectedModelId,
    setSelectedModelId,
    modelProgress,
    download,
    runtime,
    loadModel,
    pauseDownload,
    cancelDownload,
    resumeDownload,
    retryDownload,
    deleteModel,
    verifyModel,
    unloadModel,
    reloadModel,
    installedModels
  } = useAI();

  return (
    <div className="px-4 pb-24 pt-8 sm:px-6 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Models</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Choose a WebLLM-compatible model. Downloads are handled by the browser and reused offline.
            </p>
          </div>
          {adminMode && (
            <div className="grid gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <div>
                <span className="text-muted-foreground">Runtime: </span>
                {modelProgress.message}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{runtime.backend.toUpperCase()}</Badge>
                <Badge>{runtime.loadedModelId ? "Loaded" : "Lazy load"}</Badge>
                <Badge>
                  Storage {formatBytes(runtime.storageUsageBytes)} / {formatBytes(runtime.storageQuotaBytes)}
                </Badge>
                {runtime.memoryUsageMb ? <Badge>{runtime.memoryUsageMb} MB memory</Badge> : null}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {ORION_MODELS.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={selectedModelId === model.id}
              active={download.modelId === model.id}
              installed={(installedModels || []).some((item) => item.id === model.id && (item.status === "downloaded" || item.status === "loaded"))}
              loaded={runtime.loadedModelId === model.id}
              progress={download}
              adminMode={adminMode}
              onSelect={() => setSelectedModelId(model.id)}
              onLoad={() => loadModel(model.id)}
              onUnload={unloadModel}
              onReload={() => reloadModel()}
              onPause={pauseDownload}
              onCancel={cancelDownload}
              onResume={resumeDownload}
              onRetry={retryDownload}
              onDelete={() => deleteModel(model.id)}
              onVerify={() => void verifyModel(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
