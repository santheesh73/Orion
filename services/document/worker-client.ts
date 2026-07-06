"use client";

import type { DocumentKind, DocumentSearchResult, OrionDocument, OrionDocumentChunk } from "@/types/orion";

type RequestMap = {
  "parse-text": {
    input: { fileName: string; kind: DocumentKind; text: string };
    output: { content: string; previewText: string; wordCount: number; pageCount: number };
  };
  chunk: {
    input: { document: OrionDocument; chunkSize: number };
    output: { chunks: OrionDocumentChunk[] };
  };
  search: {
    input: { query: string; chunks: OrionDocumentChunk[]; documents: OrionDocument[] };
    output: { results: DocumentSearchResult[] };
  };
};

type Pending = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

class DocumentWorkerClient {
  private worker: Worker | null = null;
  private pending = new Map<string, Pending>();

  parseText(input: RequestMap["parse-text"]["input"]) {
    return this.request("parse-text", input);
  }

  chunk(input: RequestMap["chunk"]["input"]) {
    return this.request("chunk", input);
  }

  search(input: RequestMap["search"]["input"]) {
    return this.request("search", input);
  }

  private request<TType extends keyof RequestMap>(type: TType, input: RequestMap[TType]["input"]) {
    const requestId = crypto.randomUUID();
    const worker = this.ensureWorker();

    return new Promise<RequestMap[TType]["output"]>((resolve, reject) => {
      this.pending.set(requestId, { resolve: resolve as (value: unknown) => void, reject });
      worker.postMessage({ type, requestId, ...input });
    });
  }

  private ensureWorker() {
    if (!this.worker) {
      this.worker = new Worker(new URL("../../workers/document.worker.ts", import.meta.url), { type: "module" });
      this.worker.onmessage = (event: MessageEvent<{ type: string; requestId: string; message?: string }>) => {
        const pending = this.pending.get(event.data.requestId);
        if (!pending) {
          return;
        }
        this.pending.delete(event.data.requestId);
        if (event.data.type === "error") {
          pending.reject(new Error(event.data.message ?? "Document worker failed."));
          return;
        }
        pending.resolve(event.data);
      };
      this.worker.onerror = (event) => {
        const error = new Error(event.message || "Document worker crashed.");
        this.pending.forEach((pending) => pending.reject(error));
        this.pending.clear();
      };
    }
    return this.worker;
  }
}

export const documentWorkerClient = new DocumentWorkerClient();
