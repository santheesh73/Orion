"use client";

import { detectBackend } from "@/services/ai/webllm";
import { useOrionStore } from "@/store/orion-store";

export interface PrivacySnapshot {
  offline: boolean;
  backend: string;
  modelLocation: string;
  storageLocation: string;
  permissions: Array<{ name: string; state: string }>;
  capabilities: Array<{ name: string; supported: boolean }>;
  workerStatus: string;
}

export class PrivacyService {
  async snapshot(): Promise<PrivacySnapshot> {
    const runtime = useOrionStore.getState().runtime;
    const permissionNames = ["clipboard-read", "clipboard-write", "persistent-storage"] as const;
    const permissions = await Promise.all(
      permissionNames.map(async (name) => {
        try {
          const result = await navigator.permissions?.query({ name: name as PermissionName });
          return { name, state: result?.state ?? "unknown" };
        } catch {
          return { name, state: "unsupported" };
        }
      })
    );

    return {
      offline: typeof navigator !== "undefined" ? !navigator.onLine : true,
      backend: runtime.backend === "unknown" ? detectBackend() : runtime.backend,
      modelLocation: "Browser Cache API managed by WebLLM",
      storageLocation: "IndexedDB database: orion-local-ai",
      permissions,
      capabilities: [
        { name: "WebGPU", supported: typeof navigator !== "undefined" && "gpu" in navigator },
        { name: "Web Workers", supported: typeof Worker !== "undefined" },
        { name: "IndexedDB", supported: typeof indexedDB !== "undefined" },
        { name: "File System Access", supported: typeof window !== "undefined" && "showOpenFilePicker" in window },
        { name: "Clipboard Files", supported: typeof navigator !== "undefined" && "clipboard" in navigator }
      ],
      workerStatus: runtime.workerStatus
    };
  }
}

export const privacyService = new PrivacyService();
