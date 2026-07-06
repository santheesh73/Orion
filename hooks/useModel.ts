"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getModelById, getModelCacheStatus, getStorageEstimate } from "@/services/ai/model-manager";
import { workerClient } from "@/services/ai/worker-client";
import { modelService } from "@/services/database/model.service";
import { settingsService } from "@/services/database/settings.service";
import { useOrionStore } from "@/store/orion-store";
import type { ModelProgress, StoredModelMetadata } from "@/types/orion";

let autoRestoreStarted = false;

function progressToTransfer(progress: number, sizeBytes: number, elapsedSeconds: number) {
  const downloadedBytes = Math.round((progress / 100) * sizeBytes);
  const speedBytesPerSecond = elapsedSeconds > 0 ? downloadedBytes / elapsedSeconds : 0;
  const remainingBytes = Math.max(sizeBytes - downloadedBytes, 0);
  const etaSeconds = speedBytesPerSecond > 0 ? remainingBytes / speedBytesPerSecond : null;
  return { downloadedBytes, speedBytesPerSecond, etaSeconds };
}

function progressStatus(message: string, progress: number): ModelProgress["status"] {
  const normalized = message.toLowerCase();
  if (normalized.includes("verify")) return "verifying";
  if (normalized.includes("extract")) return "extracting";
  if (normalized.includes("load") || progress >= 100) return "loading";
  return "downloading";
}

export function useModel() {
  const restored = useRef(false);
  const [installedModels, setInstalledModels] = useState<StoredModelMetadata[]>([]);
  const selectedModelId = useOrionStore((state) => state.selectedModelId);
  const setSelectedModelId = useOrionStore((state) => state.setSelectedModelId);
  const setModelProgress = useOrionStore((state) => state.setModelProgress);
  const setDownload = useOrionStore((state) => state.setDownload);
  const setRuntime = useOrionStore((state) => state.setRuntime);
  const modelProgress = useOrionStore((state) => state.modelProgress);
  const download = useOrionStore((state) => state.download);
  const runtime = useOrionStore((state) => state.runtime);

  const refreshStorage = useCallback(async () => {
    const estimate = await getStorageEstimate();
    setRuntime({ storageUsageBytes: estimate.usage, storageQuotaBytes: estimate.quota });
  }, [setRuntime]);

  const refreshInstalled = useCallback(async () => {
    setInstalledModels(await modelService.list());
  }, []);

  useEffect(() => {
    void refreshStorage();
    void refreshInstalled();
    const unsubscribe = workerClient.subscribe((event) => {
      if (event.type === "download-progress") {
        const transfer = progressToTransfer(event.progress, event.sizeBytes, event.timeElapsed);
        const status = progressStatus(event.message, event.progress);
        setDownload({
          modelId: event.modelId,
          status: "downloading",
          progress: event.progress,
          sizeBytes: event.sizeBytes,
          message: event.message,
          ...transfer
        });
        setModelProgress({
          status,
          progress: event.progress,
          message: event.message,
          speedBytesPerSecond: transfer.speedBytesPerSecond,
          etaSeconds: transfer.etaSeconds ?? undefined
        });
        void modelService.recordDownload({
          id: event.modelId,
          name: getModelById(event.modelId).name,
          downloadedSize: transfer.downloadedBytes,
          backendType: runtime.backend,
          status: "downloading"
        });
      }

      if (event.type === "ready") {
        const readyModel = getModelById(event.modelId);
        setDownload({
          modelId: event.modelId,
          status: "complete",
          progress: 100,
          downloadedBytes: readyModel.sizeBytes,
          sizeBytes: readyModel.sizeBytes,
          message: event.cached ? "Download verified in browser cache" : "Model ready"
        });
        setModelProgress({ status: "ready", progress: 100, message: "Ready offline" });
        setRuntime({
          backend: event.backend,
          loadedModelId: event.modelId,
          modelLoadTimeMs: event.loadTimeMs,
          workerStatus: "ready",
          error: null
        });
        void modelService.recordDownload({
          id: event.modelId,
          name: readyModel.name,
          downloadedSize: readyModel.sizeBytes,
          backendType: event.backend,
          status: "loaded"
        }).then(refreshInstalled);
        void settingsService.update({ preferredModel: event.modelId, lastLoadedModel: event.modelId });
        void refreshStorage();
        toast.success("Local model ready");
      }

      if (event.type === "cache-status") {
        const checkedModel = getModelById(event.modelId);
        setDownload({
          modelId: event.modelId,
          status: event.cached ? "complete" : "idle",
          progress: event.cached ? 100 : 0,
          message: event.cached ? "Model download verified" : "Model is not downloaded yet"
        });
        void modelService.recordDownload({
          id: event.modelId,
          name: checkedModel.name,
          downloadedSize: event.cached ? checkedModel.sizeBytes : 0,
          backendType: runtime.backend,
          status: event.cached ? "downloaded" : "available"
        }).then(refreshInstalled);
      }

      if (event.type === "deleted") {
        setDownload({
          modelId: event.modelId,
          status: "deleted",
          progress: 0,
          downloadedBytes: 0,
          message: "Model cache deleted"
        });
        setModelProgress({ status: "idle", progress: 0, message: "Model deleted" });
        setRuntime({ loadedModelId: null, modelLoadTimeMs: null });
        void modelService.markDeleted(event.modelId).then(refreshInstalled);
        void refreshStorage();
        toast.success("Model deleted from browser cache");
      }

      if (event.type === "unloaded") {
        setModelProgress({ status: "idle", progress: 0, message: "Model unloaded" });
        setRuntime({ loadedModelId: null, modelLoadTimeMs: null });
        void refreshInstalled();
        toast.success("Model unloaded");
      }

      if (event.type === "error" && (event.stage === "download" || event.stage === "load" || event.stage === "cache")) {
        setDownload({ status: event.stage === "download" ? "paused" : "error", message: event.message });
        setModelProgress({ status: event.stage === "download" ? "paused" : "error", progress: modelProgress.progress, message: event.message });
        setRuntime({ error: event.message, workerStatus: event.stage === "download" ? "ready" : "crashed" });
        toast.error(event.message);
      }
    });
    return unsubscribe;
  }, [modelProgress.progress, refreshInstalled, refreshStorage, runtime.backend, setDownload, setModelProgress, setRuntime]);

  useEffect(() => {
    if (restored.current || autoRestoreStarted) {
      return;
    }
    restored.current = true;
    autoRestoreStarted = true;
    void settingsService.getOrCreate().then((settings) => {
      const modelId = settings.ai.autoLoadLastModel ? settings.lastLoadedModel ?? settings.preferredModel : settings.preferredModel;
      setSelectedModelId(modelId);
      if (settings.ai.autoLoadLastModel && settings.lastLoadedModel) {
        const model = getModelById(settings.lastLoadedModel);
        setModelProgress({ status: "checking", progress: 0, message: "Restoring last local model", startedAt: Date.now() });
        setRuntime({ workerStatus: "busy", error: null });
        workerClient.load(model.id, model.sizeBytes);
      } else {
        workerClient.verify(modelId);
      }
    });
  }, [setModelProgress, setRuntime, setSelectedModelId]);

  const selectModel = useCallback(
    (modelId: string) => {
      setSelectedModelId(modelId);
      void settingsService.update({ preferredModel: modelId });
    },
    [setSelectedModelId]
  );

  const loadModel = useCallback(
    (modelId = selectedModelId) => {
      const model = getModelById(modelId);
      selectModel(modelId);
      setDownload({
        modelId,
        status: "checking",
        progress: 0,
        sizeBytes: model.sizeBytes,
        downloadedBytes: 0,
        speedBytesPerSecond: 0,
        etaSeconds: null,
        message: "Checking browser cache"
      });
      setModelProgress({ status: "checking", progress: 0, message: "Checking browser cache", startedAt: Date.now() });
      setRuntime({ workerStatus: "busy", error: null });
      workerClient.load(modelId, model.sizeBytes);
    },
    [selectedModelId, selectModel, setDownload, setModelProgress, setRuntime]
  );

  const pauseDownload = useCallback(() => {
    workerClient.cancelLoad();
    setDownload({ status: "paused", message: "Download paused. Resume will continue from cached chunks where the browser allows it." });
    setModelProgress({ status: "paused", progress: download.progress, message: "Download paused" });
  }, [download.progress, setDownload, setModelProgress]);

  const cancelDownload = useCallback(() => {
    workerClient.cancelLoad();
    setDownload({ status: "idle", progress: 0, downloadedBytes: 0, speedBytesPerSecond: 0, etaSeconds: null, message: "Download cancelled" });
    setModelProgress({ status: "idle", progress: 0, message: "Download cancelled" });
    setRuntime({ workerStatus: "ready" });
  }, [setDownload, setModelProgress, setRuntime]);

  const resumeDownload = useCallback(() => {
    if (download.modelId) {
      loadModel(download.modelId);
    }
  }, [download.modelId, loadModel]);

  const retryDownload = useCallback(() => {
    loadModel(download.modelId ?? selectedModelId);
  }, [download.modelId, loadModel, selectedModelId]);

  const deleteModel = useCallback(
    (modelId = selectedModelId) => {
      setDownload({ modelId, status: "checking", message: "Deleting model cache" });
      workerClient.delete(modelId);
    },
    [selectedModelId, setDownload]
  );

  const unloadModel = useCallback(() => {
    setModelProgress({ status: "unloading", progress: 100, message: "Unloading model" });
    setRuntime({ workerStatus: "busy" });
    workerClient.unload();
  }, [setModelProgress, setRuntime]);

  const reloadModel = useCallback(() => {
    loadModel(runtime.loadedModelId ?? selectedModelId);
  }, [loadModel, runtime.loadedModelId, selectedModelId]);

  const resetWorker = useCallback(() => {
    setRuntime({ workerStatus: "initializing", loadedModelId: null, modelLoadTimeMs: null, error: null });
    setModelProgress({ status: "idle", progress: 0, message: "Worker reset" });
    workerClient.reset();
  }, [setModelProgress, setRuntime]);

  const verifyModel = useCallback(async (modelId = selectedModelId) => {
    setDownload({ modelId, status: "checking", message: "Verifying model cache" });
    const cached = await getModelCacheStatus(modelId);
    setDownload({
      modelId,
      status: cached ? "complete" : "idle",
      progress: cached ? 100 : 0,
      message: cached ? "Model download verified" : "Model is not downloaded yet"
    });
    workerClient.verify(modelId);
  }, [selectedModelId, setDownload]);

  return {
    selectedModelId,
    setSelectedModelId: selectModel,
    installedModels,
    model: getModelById(selectedModelId),
    modelProgress,
    download,
    runtime,
    loadModel,
    pauseDownload,
    cancelDownload,
    resumeDownload,
    retryDownload,
    deleteModel,
    unloadModel,
    reloadModel,
    resetWorker,
    verifyModel,
    refreshStorage
  };
}
