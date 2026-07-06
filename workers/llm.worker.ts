import {
  CreateMLCEngine,
  deleteModelAllInfoInCache,
  hasModelInCache,
  modelVersion,
  prebuiltAppConfig,
  type ChatCompletionChunk,
  type InitProgressReport,
  type MLCEngine
} from "@mlc-ai/web-llm";
import type { PromptMessage, RuntimeBackend } from "@/types/orion";

type WorkerInbound =
  | { type: "init" }
  | { type: "load"; requestId: string; modelId: string; sizeBytes: number }
  | {
      type: "generate";
      requestId: string;
      modelId: string;
      messages: PromptMessage[];
      temperature: number;
      topP: number;
      maxTokens: number;
    }
  | { type: "cancel-generation"; requestId?: string }
  | { type: "verify"; requestId: string; modelId: string }
  | { type: "delete"; requestId: string; modelId: string }
  | { type: "unload"; requestId: string }
  | { type: "stats"; requestId: string };

type WorkerOutbound =
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

let engine: MLCEngine | null = null;
let loadedModelId: string | null = null;
let backend: RuntimeBackend = "unknown";
let activeGenerationId: string | null = null;

const scope = self as DedicatedWorkerGlobalScope;
const post = (message: WorkerOutbound) => scope.postMessage(message);

function isSupportedModel(modelId: string) {
  return prebuiltAppConfig.model_list.some((model) => model.model_id === modelId);
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown local AI error";
  if (/model.*not found|unknown model|invalid model|model_id/iu.test(message)) {
    return `Model registry unavailable or unsupported model id. ${message}`;
  }
  if (/out of memory|OOM|device lost|memory allocation/iu.test(message)) {
    return "The model could not fit in available GPU memory. Try a smaller model or close other GPU-heavy tabs.";
  }
  if (/webgpu|navigator\.gpu|adapter|requestadapter|requestdevice/iu.test(message)) {
    return `Unable to initialize WebGPU for local inference. Try Chrome or Edge with WebGPU enabled. Details: ${message}`;
  }
  if (/content security policy|csp|violates.*policy/iu.test(message)) {
    return `Model download was blocked by the app security policy. Details: ${message}`;
  }
  if (/integrity|sha|hash|corrupt/iu.test(message)) {
    return `Downloaded model cache failed verification. Delete the model and retry. Details: ${message}`;
  }
  if (/fetch|network|download|cache|failed to fetch|load failed/iu.test(message)) {
    return `Model download failed or was interrupted. Check network access to Hugging Face and GitHub model assets, then retry. Details: ${message}`;
  }
  return message;
}

function detectWorkerBackend(): RuntimeBackend {
  const navigatorLike = scope.navigator as Navigator & { gpu?: unknown };
  if (navigatorLike.gpu) {
    return "webgpu";
  }
  if (typeof WebAssembly !== "undefined") {
    return "wasm";
  }
  return "unsupported";
}

async function postRuntime() {
  backend = detectWorkerBackend();
  let gpuVendor: string | null = null;
  let maxStorageBufferBindingSize: number | null = null;

  if (engine) {
    try {
      gpuVendor = (await engine.getGPUVendor()) || null;
      maxStorageBufferBindingSize = await engine.getMaxStorageBufferBindingSize();
    } catch {
      gpuVendor = null;
      maxStorageBufferBindingSize = null;
    }
  }

  post({ type: "runtime", backend, gpuVendor, maxStorageBufferBindingSize, webllmVersion: modelVersion });
}

async function ensureEngine(modelId: string, requestId: string, sizeBytes: number) {
  if (!isSupportedModel(modelId)) {
    throw new Error(`Unsupported WebLLM model id: ${modelId}`);
  }

  if (engine && loadedModelId === modelId) {
    return true;
  }

  const startedAt = performance.now();
  const wasCached = await hasModelInCache(modelId, prebuiltAppConfig);

  const progressCallback = (report: InitProgressReport) => {
    post({
      type: "download-progress",
      requestId,
      modelId,
      progress: Math.round(report.progress * 100),
      message: report.text,
      timeElapsed: report.timeElapsed,
      sizeBytes
    });
  };

  if (engine) {
    engine.setInitProgressCallback(progressCallback);
    await engine.reload(modelId);
  } else {
    engine = await CreateMLCEngine(modelId, {
      appConfig: prebuiltAppConfig,
      initProgressCallback: progressCallback,
      logLevel: "WARN"
    });
  }

  loadedModelId = modelId;
  await postRuntime();
  post({
    type: "ready",
    requestId,
    modelId,
    loadTimeMs: performance.now() - startedAt,
    cached: wasCached || (await hasModelInCache(modelId, prebuiltAppConfig)),
    backend
  });
  return true;
}

async function generate(event: Extract<WorkerInbound, { type: "generate" }>) {
  if (!engine || loadedModelId !== event.modelId) {
    throw new Error("Load the selected local model before generating.");
  }

  activeGenerationId = event.requestId;
  post({ type: "generation-start", requestId: event.requestId });

  const stream = await engine.chat.completions.create({
    messages: event.messages,
    stream: true,
    temperature: event.temperature,
    top_p: event.topP,
    max_tokens: event.maxTokens
  });

  for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
    if (activeGenerationId !== event.requestId) {
      break;
    }
    const content = chunk.choices[0]?.delta.content;
    if (content) {
      post({ type: "token", requestId: event.requestId, content });
    }
  }

  const statsText = engine ? await engine.runtimeStatsText().catch(() => null) : null;
  activeGenerationId = null;
  post({ type: "generation-done", requestId: event.requestId, statsText });
}

scope.onmessage = async (messageEvent: MessageEvent<WorkerInbound>) => {
  const event = messageEvent.data;
  try {
    if (event.type === "init") {
      await postRuntime();
      return;
    }

    if (event.type === "load") {
      await ensureEngine(event.modelId, event.requestId, event.sizeBytes);
      return;
    }

    if (event.type === "generate") {
      await generate(event);
      return;
    }

    if (event.type === "cancel-generation") {
      activeGenerationId = null;
      engine?.interruptGenerate();
      post({ type: "generation-cancelled", requestId: event.requestId });
      return;
    }

    if (event.type === "verify") {
      if (!isSupportedModel(event.modelId)) {
        throw new Error(`Unsupported WebLLM model id: ${event.modelId}`);
      }
      post({
        type: "cache-status",
        requestId: event.requestId,
        modelId: event.modelId,
        cached: await hasModelInCache(event.modelId, prebuiltAppConfig)
      });
      return;
    }

    if (event.type === "delete") {
      if (loadedModelId === event.modelId) {
        await engine?.unload();
        engine = null;
        loadedModelId = null;
      }
      await deleteModelAllInfoInCache(event.modelId, prebuiltAppConfig);
      post({ type: "deleted", requestId: event.requestId, modelId: event.modelId });
      return;
    }

    if (event.type === "unload") {
      await engine?.unload();
      engine = null;
      loadedModelId = null;
      post({ type: "unloaded", requestId: event.requestId });
      return;
    }

    if (event.type === "stats") {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
      post({
        type: "stats",
        requestId: event.requestId,
        statsText: engine ? await engine.runtimeStatsText().catch(() => null) : null,
        memoryUsageMb: memory?.usedJSHeapSize ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : null
      });
    }
  } catch (error) {
    const stage = event.type === "generate" ? "generate" : event.type === "delete" || event.type === "verify" ? "cache" : "load";
    post({
      type: "error",
      requestId: "requestId" in event ? event.requestId : undefined,
      stage,
      message: friendlyError(error),
      recoverable: true
    });
  }
};
