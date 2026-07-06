"use client";

import { modelRepository } from "@/repositories/model.repository";
import type { RuntimeBackend, StoredModelMetadata } from "@/types/orion";

export class ModelService {
  async recordDownload({
    id,
    name,
    downloadedSize,
    backendType,
    status
  }: {
    id: string;
    name: string;
    downloadedSize: number;
    backendType: RuntimeBackend;
    status: StoredModelMetadata["status"];
  }) {
    const current = await modelRepository.getById(id);
    return modelRepository.upsert({
      id,
      name,
      version: id,
      downloadedSize,
      downloadDate: status === "downloaded" || status === "loaded" ? current?.downloadDate ?? Date.now() : current?.downloadDate ?? null,
      storagePathMetadata: "IndexedDB Cache API metadata managed by WebLLM",
      backendType,
      status,
      updatedAt: Date.now()
    });
  }

  async list() {
    return modelRepository.list();
  }

  async markDeleted(id: string) {
    return modelRepository.remove(id);
  }
}

export const modelService = new ModelService();
