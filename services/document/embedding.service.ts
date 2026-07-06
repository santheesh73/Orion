"use client";

import type { OrionDocumentChunk } from "@/types/orion";

export interface EmbeddingProvider {
  name: string;
  prepare(chunks: OrionDocumentChunk[]): Promise<OrionDocumentChunk[]>;
}

class LocalHashEmbeddingProvider implements EmbeddingProvider {
  name = "local-hash-v1";

  async prepare(chunks: OrionDocumentChunk[]) {
    return chunks;
  }
}

class EmbeddingService {
  private provider: EmbeddingProvider = new LocalHashEmbeddingProvider();

  setProvider(provider: EmbeddingProvider) {
    this.provider = provider;
  }

  async prepare(chunks: OrionDocumentChunk[]) {
    return this.provider.prepare(chunks);
  }

  getProviderName() {
    return this.provider.name;
  }
}

export const embeddingService = new EmbeddingService();
