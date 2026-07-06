"use client";

import { useEffect } from "react";
import { detectBackend } from "@/services/ai/webllm";
import { workerClient } from "@/services/ai/worker-client";
import { useOrionStore } from "@/store/orion-store";

export function useWorker() {
  const setRuntime = useOrionStore((state) => state.setRuntime);

  useEffect(() => {
    setRuntime({ backend: detectBackend(), workerStatus: "initializing" });
    const unsubscribe = workerClient.subscribe((event) => {
      if (event.type === "runtime") {
        setRuntime({
          backend: event.backend,
          gpuVendor: event.gpuVendor,
          maxStorageBufferBindingSize: event.maxStorageBufferBindingSize,
          workerStatus: "ready",
          error: null
        });
      }

      if (event.type === "error" && event.stage === "worker") {
        setRuntime({ workerStatus: "crashed", error: event.message });
      }
    });
    workerClient.init();
    return unsubscribe;
  }, [setRuntime]);

  return {
    workerStatus: useOrionStore((state) => state.runtime.workerStatus),
    backend: useOrionStore((state) => state.runtime.backend)
  };
}
