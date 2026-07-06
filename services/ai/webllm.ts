"use client";

import type { PromptMessage, RuntimeBackend } from "@/types/orion";
import { getModelById } from "@/services/ai/model-manager";

export interface AssembledPrompt {
  messages: PromptMessage[];
  trimmedMessages: number;
  estimatedTokens: number;
}

export function detectBackend(): RuntimeBackend {
  if (typeof window === "undefined") {
    return "unknown";
  }
  if ("gpu" in navigator) {
    return "webgpu";
  }
  if (typeof WebAssembly !== "undefined") {
    return "wasm";
  }
  return "unsupported";
}

export function estimateTokens(text: string) {
  return Math.ceil(text.trim().length / 4);
}

export function estimateMessagesTokens(messages: PromptMessage[]) {
  return messages.reduce((total, message) => total + estimateTokens(message.content) + 4, 0);
}

export function validatePrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Enter a message before sending." };
  }
  if (trimmed.length > 16000) {
    return { ok: false as const, error: "This prompt is too large for the local context window." };
  }
  return { ok: true as const, prompt: trimmed };
}

export function assemblePrompt({
  modelId,
  systemPrompt,
  history,
  nextPrompt,
  maxOutputTokens
}: {
  modelId: string;
  systemPrompt: string;
  history: PromptMessage[];
  nextPrompt: string;
  maxOutputTokens: number;
}): AssembledPrompt {
  const model = getModelById(modelId);
  const budget = Math.max(512, model.contextWindow - maxOutputTokens - estimateTokens(systemPrompt) - 32);
  const userMessage: PromptMessage = { role: "user", content: nextPrompt };
  const kept: PromptMessage[] = [userMessage];
  let used = estimateMessagesTokens(kept);
  let trimmedMessages = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    const cost = estimateMessagesTokens([message]);
    if (used + cost > budget) {
      trimmedMessages = index + 1;
      break;
    }
    kept.unshift(message);
    used += cost;
  }

  return {
    messages: [{ role: "system", content: systemPrompt }, ...kept],
    trimmedMessages,
    estimatedTokens: used + estimateTokens(systemPrompt)
  };
}

export function createSummarizationHookPayload(trimmed: PromptMessage[]) {
  return {
    enabled: false,
    messages: trimmed,
    reason: "Reserved for Phase 6 conversation summarization without changing the Phase 5 pipeline."
  };
}
