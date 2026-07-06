"use client";

import { db } from "@/lib/db/orion-db";
import { createId, now } from "@/services/database/ids";
import { documentWorkerClient } from "@/services/document/worker-client";
import type { DocumentSearchResult, OrionDocument } from "@/types/orion";

export async function searchDocuments(query: string, documentIds: string[] = []): Promise<DocumentSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const documents =
    documentIds.length > 0
      ? (await db.documents.bulkGet(documentIds)).filter((document): document is OrionDocument => Boolean(document))
      : await db.documents.orderBy("updatedAt").reverse().toArray();
  const allowed = new Set(documents.map((document) => document.id));
  const chunks = documentIds.length > 0
    ? await db.documentChunks.where("documentId").anyOf(documentIds).toArray()
    : await db.documentChunks.toArray();
  const result = await documentWorkerClient.search({
    query: trimmed,
    documents,
    chunks: chunks.filter((chunk) => allowed.has(chunk.documentId))
  });

  await db.documentSearchHistory.add({
    id: createId("doc_search"),
    query: trimmed,
    documentIds,
    createdAt: now()
  });

  return result.results;
}

export async function recentDocumentSearches(limit = 8) {
  return db.documentSearchHistory.orderBy("createdAt").reverse().limit(limit).toArray();
}
