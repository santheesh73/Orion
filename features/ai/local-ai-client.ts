"use client";

import { getModelById } from "@/services/ai/model-manager";
import { workerClient, type WorkerClientEvent } from "@/services/ai/worker-client";
import { useOrionStore } from "@/store/orion-store";
import type { ChatMessage, GenerationSettings, PromptMessage } from "@/types/orion";

type ClientEvent =
  | { type: "progress"; progress: number; message: string }
  | { type: "ready"; modelId: string }
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

type Listener = (event: ClientEvent) => void;

class LocalAiClient {
  private listeners = new Set<Listener>();
  private loadedModelId: string | null = null;
  private activeGenerationId: string | null = null;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    const unsubscribe = workerClient.subscribe((event) => this.handleWorkerEvent(event));
    return () => {
      this.listeners.delete(listener);
      unsubscribe();
    };
  }

  load(modelId: string) {
    this.loadedModelId = modelId;
    workerClient.load(modelId, getModelById(modelId).sizeBytes);
  }

  generate(messages: ChatMessage[], settings: GenerationSettings) {
    const modelId = this.loadedModelId ?? useOrionStore.getState().runtime.loadedModelId;
    if (!modelId) {
      this.emit({ type: "error", message: "Load a local model before generating." });
      return;
    }

    this.activeGenerationId = workerClient.generate({
      modelId,
      messages: [
        { role: "system", content: settings.systemPrompt },
        ...messages
          .filter((message) => message.role === "user" || message.role === "assistant")
          .map((message) => ({ role: message.role as "user" | "assistant", content: message.content }))
      ],
      temperature: settings.temperature,
      topP: settings.topP,
      maxTokens: settings.maxTokens
    });
  }

  generatePromptMessages(messages: PromptMessage[], settings: GenerationSettings) {
    const modelId = this.loadedModelId ?? useOrionStore.getState().runtime.loadedModelId;
    if (!modelId) {
      this.emit({ type: "error", message: "Load a local model before generating." });
      return;
    }

    this.activeGenerationId = workerClient.generate({
      modelId,
      messages,
      temperature: settings.temperature,
      topP: settings.topP,
      maxTokens: settings.maxTokens
    });
  }

  reset() {
    workerClient.cancelGeneration(this.activeGenerationId ?? undefined);
    workerClient.unload();
    this.loadedModelId = null;
  }

  private handleWorkerEvent(event: WorkerClientEvent) {
    if (event.type === "download-progress") {
      this.emit({ type: "progress", progress: event.progress, message: event.message });
    }
    if (event.type === "ready") {
      this.loadedModelId = event.modelId;
      this.emit({ type: "ready", modelId: event.modelId });
    }
    if (event.type === "token") {
      this.emit({ type: "token", content: event.content });
    }
    if (event.type === "generation-done") {
      this.activeGenerationId = null;
      this.emit({ type: "done" });
    }
    if (event.type === "error") {
      this.emit({ type: "error", message: event.message });
    }
  }

  private emit(event: ClientEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const localAiClient = new LocalAiClient();
