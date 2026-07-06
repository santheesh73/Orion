"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { assemblePrompt, createSummarizationHookPayload, validatePrompt } from "@/services/ai/webllm";
import { workerClient } from "@/services/ai/worker-client";
import { useOrionStore } from "@/store/orion-store";
import type { PromptMessage } from "@/types/orion";
import { useStreaming } from "@/hooks/useStreaming";

interface GenerationCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export function useGeneration() {
  const metrics = useStreaming();
  const callbacks = useRef(new Map<string, GenerationCallbacks>());
  const activeRequestId = useRef<string | null>(null);
  const selectedModelId = useOrionStore((state) => state.selectedModelId);
  const settings = useOrionStore((state) => state.settings);
  const runtime = useOrionStore((state) => state.runtime);
  const generation = useOrionStore((state) => state.generation);
  const setGeneration = useOrionStore((state) => state.setGeneration);
  const setRuntime = useOrionStore((state) => state.setRuntime);

  useEffect(() => {
    const unsubscribe = workerClient.subscribe((event) => {
      if (event.type === "generation-start") {
        activeRequestId.current = event.requestId;
        metrics.start();
        setGeneration({
          status: "streaming",
          startedAt: Date.now(),
          firstTokenAt: null,
          completedAt: null,
          tokenCount: 0,
          tokensPerSecond: 0,
          latencyMs: null,
          error: null
        });
      }

      if (event.type === "token") {
        const metric = metrics.pushToken(event.content);
        setGeneration({
          firstTokenAt: Date.now(),
          tokenCount: metric.tokenCount,
          tokensPerSecond: metric.tokensPerSecond,
          latencyMs: metric.latencyMs
        });
        callbacks.current.get(event.requestId)?.onToken(event.content);
      }

      if (event.type === "generation-done") {
        const metric = metrics.complete();
        setGeneration({
          status: "complete",
          completedAt: Date.now(),
          tokenCount: metric.tokenCount,
          tokensPerSecond: metric.tokensPerSecond,
          latencyMs: metric.latencyMs
        });
        callbacks.current.get(event.requestId)?.onDone();
        callbacks.current.delete(event.requestId);
        activeRequestId.current = null;
        workerClient.stats();
      }

      if (event.type === "generation-cancelled") {
        setGeneration({ status: "idle", completedAt: Date.now() });
        activeRequestId.current = null;
      }

      if (event.type === "stats") {
        setRuntime({ memoryUsageMb: event.memoryUsageMb });
      }

      if (event.type === "error" && event.stage === "generate") {
        setGeneration({ status: "error", error: event.message, completedAt: Date.now() });
        if (event.requestId) {
          callbacks.current.get(event.requestId)?.onError(event.message);
          callbacks.current.delete(event.requestId);
        }
        activeRequestId.current = null;
        toast.error(event.message);
      }
    });
    return unsubscribe;
  }, [metrics, setGeneration, setRuntime]);

  const generate = useCallback(
    ({
      history,
      prompt,
      onToken,
      onDone,
      onError
    }: {
      history: PromptMessage[];
      prompt: string;
      onToken: (token: string) => void;
      onDone: () => void;
      onError: (message: string) => void;
    }) => {
      const validation = validatePrompt(prompt);
      if (!validation.ok) {
        onError(validation.error);
        toast.error(validation.error);
        return null;
      }

      if (runtime.loadedModelId !== selectedModelId) {
        const message = "Please load a model.";
        onError(message);
        toast.error(message);
        return null;
      }

      setGeneration({ status: "validating", error: null });
      const assembled = assemblePrompt({
        modelId: selectedModelId,
        systemPrompt: settings.systemPrompt,
        history,
        nextPrompt: validation.prompt,
        maxOutputTokens: settings.maxTokens
      });

      if (assembled.trimmedMessages > 0) {
        createSummarizationHookPayload(history.slice(0, assembled.trimmedMessages));
      }

      const requestId = workerClient.generate({
        modelId: selectedModelId,
        messages: assembled.messages,
        temperature: settings.temperature,
        topP: settings.topP,
        maxTokens: settings.maxTokens
      });
      callbacks.current.set(requestId, { onToken, onDone, onError });
      activeRequestId.current = requestId;
      return requestId;
    },
    [runtime.loadedModelId, selectedModelId, setGeneration, settings.maxTokens, settings.systemPrompt, settings.temperature, settings.topP]
  );

  const stopGeneration = useCallback(() => {
    setGeneration({ status: "stopping" });
    workerClient.cancelGeneration(activeRequestId.current ?? undefined);
  }, [setGeneration]);

  return {
    generation,
    generate,
    stopGeneration
  };
}
