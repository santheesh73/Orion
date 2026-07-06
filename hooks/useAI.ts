"use client";

import { useGeneration } from "@/hooks/useGeneration";
import { useModel } from "@/hooks/useModel";
import { useWorker } from "@/hooks/useWorker";

export function useAI() {
  useWorker();
  const model = useModel();
  const generation = useGeneration();

  return {
    ...model,
    ...generation,
    ready: model.runtime.loadedModelId === model.selectedModelId && model.modelProgress.status === "ready"
  };
}
