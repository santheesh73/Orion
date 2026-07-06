"use client";

import { useEffect, useState } from "react";
import { documentService } from "@/services/document/document.service";
import type { OrionDocumentChunk } from "@/types/orion";

export function usePreview(documentId: string | null) {
  const [chunks, setChunks] = useState<OrionDocumentChunk[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!documentId) {
        setChunks([]);
        return;
      }
      setLoading(true);
      await documentService.markOpened(documentId);
      const nextChunks = await documentService.chunks(documentId);
      if (!cancelled) {
        setChunks(nextChunks);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return { chunks, loading };
}
