"use client";

import type { RuntimeBackend } from "@/types/orion";

export type WorkerClientEvent =
  | { type: "runtime"; backend: RuntimeBackend; gpuVendor: string | null; maxStorageBufferBindingSize: number | null; webllmVersion: string }
  | { type: "download-progress"; requestId: string; modelId: string; progress: number; message: string; timeElapsed: number; sizeBytes: number }
  | { type: "ready"; requestId: string; modelId: string; loadTimeMs: number; cached: boolean; backend: RuntimeBackend }
  | { type: "cache-status"; requestId: string; modelId: string; cached: boolean }
  | { type: "deleted"; requestId: string; modelId: string }
  | { type: "token"; requestId: string; content: string }
  | { type: "generation-start"; requestId: string }
  | { type: "generation-done"; requestId: string; statsText: string | null }
  | { type: "generation-cancelled"; requestId?: string }
  | { type: "unloaded"; requestId: string }
  | { type: "stats"; requestId: string; statsText: string | null; memoryUsageMb: number | null }
  | { type: "error"; requestId?: string; stage: "runtime" | "download" | "load" | "generate" | "cache" | "worker"; message: string; recoverable: boolean };

type Listener = (event: WorkerClientEvent) => void;

function requestId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

class WorkerClient {
  private worker: Worker | null = null;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    this.ensureWorker();
    return () => {
      this.listeners.delete(listener);
    };
  }

  init() {
    this.ensureWorker();
    this.worker?.postMessage({ type: "init" });
  }

  load(modelId: string, sizeBytes: number) {
    const id = requestId("load");
    this.ensureWorker();
    this.worker?.postMessage({ type: "load", requestId: id, modelId, sizeBytes });
    return id;
  }

  generate(payload: {
    modelId: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    temperature: number;
    topP: number;
    maxTokens: number;
  }) {
    const id = requestId("gen");
    this.ensureWorker();
    this.worker?.postMessage({ type: "generate", requestId: id, ...payload });
    return id;
  }

  cancelGeneration(requestId?: string) {
    this.worker?.postMessage({ type: "cancel-generation", requestId });
  }

  cancelLoad() {
    this.worker?.terminate();
    this.worker = null;
    this.emit({ type: "error", stage: "download", message: "Model download was paused. Resume to continue from the browser cache.", recoverable: true });
    this.ensureWorker();
  }

  reset() {
    this.worker?.terminate();
    this.worker = null;
    this.ensureWorker();
    const worker = this.worker as Worker | null;
    worker?.postMessage({ type: "init" });
  }

  verify(modelId: string) {
    const id = requestId("verify");
    this.ensureWorker();
    this.worker?.postMessage({ type: "verify", requestId: id, modelId });
    return id;
  }

  delete(modelId: string) {
    const id = requestId("delete");
    this.ensureWorker();
    this.worker?.postMessage({ type: "delete", requestId: id, modelId });
    return id;
  }

  unload() {
    const id = requestId("unload");
    this.worker?.postMessage({ type: "unload", requestId: id });
    return id;
  }

  stats() {
    const id = requestId("stats");
    this.worker?.postMessage({ type: "stats", requestId: id });
    return id;
  }

  private ensureWorker() {
    if (this.worker || typeof window === "undefined") {
      return;
    }

    this.worker = new Worker(new URL("../../workers/llm.worker.ts", import.meta.url), {
      type: "module",
      name: "orion-llm-worker"
    });
    this.worker.onmessage = (event: MessageEvent<WorkerClientEvent>) => {
      this.emit(event.data);
    };
    this.worker.onerror = () => {
      this.emit({
        type: "error",
        stage: "worker",
        message: "The local AI worker stopped unexpectedly. Orion recovered the worker; retry the last action.",
        recoverable: true
      });
      this.worker?.terminate();
      this.worker = null;
    };
  }

  private emit(event: WorkerClientEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const workerClient = new WorkerClient();
