"use client";

import { hasModelInCache, prebuiltAppConfig, type ModelRecord } from "@mlc-ai/web-llm";
import type { OrionModel } from "@/types/orion";

const GB = 1024 * 1024 * 1024;

const PREFERRED_MODEL_IDS = [
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  "gemma3-1b-it-q4f16_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
  "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC"
];

const DESCRIPTIONS: Record<string, string> = {
  "Llama-3.2-1B-Instruct-q4f16_1-MLC": "Fast, compact general assistant model for everyday offline chat.",
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC": "Efficient multilingual instruction model with strong small-model reasoning.",
  "gemma3-1b-it-q4f16_1-MLC": "Small instruction-tuned Gemma model tuned for responsive local conversations.",
  "Phi-3.5-mini-instruct-q4f16_1-MLC": "Stronger reasoning model with a larger memory footprint for capable devices.",
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC": "Low-footprint assistant model for constrained laptops and tablets.",
  "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC": "Tiny chat model for quick smoke tests and very limited devices."
};

export const DEFAULT_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

function titleFromId(modelId: string) {
  return modelId
    .replace(/-MLC(?:-1k)?$/u, "")
    .replace(/q[0-9]f[0-9]{2}(?:_[0-9])?/u, "")
    .replace(/-/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function familyFromId(modelId: string) {
  const normalized = modelId.toLowerCase();
  if (normalized.includes("llama")) return "Llama";
  if (normalized.includes("qwen")) return "Qwen";
  if (normalized.includes("gemma")) return "Gemma";
  if (normalized.includes("phi")) return "Phi";
  if (normalized.includes("smollm")) return "SmolLM";
  if (normalized.includes("tinyllama")) return "TinyLlama";
  return "WebLLM";
}

function contextWindow(record: ModelRecord) {
  return record.overrides?.context_window_size ?? (record.model_id.endsWith("-1k") ? 1024 : 4096);
}

function sizeBytes(record: ModelRecord) {
  const vram = record.vram_required_MB ?? 1024;
  return Math.round(vram * 1.15 * 1024 * 1024);
}

function formatSize(bytes: number) {
  return `${(bytes / GB).toFixed(bytes >= GB ? 1 : 2)} GB`;
}

export function getSupportedModelRecords() {
  const recordsById = new Map(prebuiltAppConfig.model_list.map((record) => [record.model_id, record]));
  return PREFERRED_MODEL_IDS.map((id) => recordsById.get(id)).filter((record): record is ModelRecord => Boolean(record));
}

export function getSupportedModels(): OrionModel[] {
  return getSupportedModelRecords().map((record) => {
    const bytes = sizeBytes(record);
    return {
      id: record.model_id,
      name: titleFromId(record.model_id),
      size: formatSize(bytes),
      sizeBytes: bytes,
      contextWindow: contextWindow(record),
      family: familyFromId(record.model_id),
      description: DESCRIPTIONS[record.model_id] ?? "WebLLM-compatible local chat model.",
      lowResource: Boolean(record.low_resource_required),
      vramRequiredMb: record.vram_required_MB ?? Math.round(bytes / 1024 / 1024)
    };
  });
}

export function isWebLLMSupportedModel(modelId: string) {
  return prebuiltAppConfig.model_list.some((record) => record.model_id === modelId);
}

export function getModelById(modelId: string) {
  return getSupportedModels().find((model) => model.id === modelId) ?? getSupportedModels()[0];
}

export async function getModelCacheStatus(modelId: string) {
  if (!isWebLLMSupportedModel(modelId)) {
    return false;
  }
  return hasModelInCache(modelId, prebuiltAppConfig);
}

export async function getStorageEstimate() {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return { usage: 0, quota: 0 };
  }
  const estimate = await navigator.storage.estimate();
  return {
    usage: estimate.usage ?? 0,
    quota: estimate.quota ?? 0
  };
}
