"use client";

import { db } from "@/lib/db/orion-db";
import { getStorageEstimate } from "@/services/ai/model-manager";

export interface StorageBreakdown {
  totalUsage: number;
  quota: number;
  free: number;
  databaseSize: number;
  conversationSize: number;
  documentSize: number;
  modelSize: number;
  cacheSize: number;
}

function sizeOf(value: unknown) {
  return new Blob([JSON.stringify(value)]).size;
}

export class StorageService {
  async estimate(): Promise<StorageBreakdown> {
    const [storage, conversations, messages, documents, chunks, models, settings, searches] = await Promise.all([
      getStorageEstimate(),
      db.conversations.toArray(),
      db.messages.toArray(),
      db.documents.toArray(),
      db.documentChunks.toArray(),
      db.models.toArray(),
      db.settings.toArray(),
      db.documentSearchHistory.toArray()
    ]);
    const conversationSize = sizeOf([...conversations, ...messages]);
    const documentSize = sizeOf([...documents, ...chunks, ...searches]);
    const modelSize = sizeOf(models);
    const databaseSize = sizeOf([...settings, ...conversations, ...messages, ...documents, ...chunks, ...models]);
    const cacheSize = Math.max(storage.usage - databaseSize, 0);
    return {
      totalUsage: storage.usage,
      quota: storage.quota,
      free: Math.max(storage.quota - storage.usage, 0),
      databaseSize,
      conversationSize,
      documentSize,
      modelSize,
      cacheSize
    };
  }

  async clearConversations() {
    await db.transaction("rw", db.conversations, db.messages, db.statistics, async () => {
      await db.messages.clear();
      await db.statistics.clear();
      await db.conversations.clear();
    });
  }

  async clearDocuments() {
    await db.transaction("rw", db.documents, db.documentChunks, db.documentFolders, db.documentSearchHistory, async () => {
      await db.documentSearchHistory.clear();
      await db.documentChunks.clear();
      await db.documentFolders.clear();
      await db.documents.clear();
    });
  }

  async clearModelMetadata() {
    await db.models.clear();
  }

  async clearCache() {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.toLowerCase().includes("orion") || key.toLowerCase().includes("webllm")).map((key) => caches.delete(key)));
    }
  }

  async optimizeDatabase() {
    await db.close();
    await db.open();
  }
}

export const storageService = new StorageService();
