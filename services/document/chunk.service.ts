"use client";

import type { OrionDocument, OrionDocumentChunk } from "@/types/orion";
import { documentWorkerClient } from "@/services/document/worker-client";

export const DEFAULT_CHUNK_SIZE = 1800;

export async function chunkDocument(document: OrionDocument, chunkSize = DEFAULT_CHUNK_SIZE): Promise<OrionDocumentChunk[]> {
  const result = await documentWorkerClient.chunk({ document, chunkSize });
  return result.chunks;
}
