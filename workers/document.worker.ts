import type { DocumentKind, DocumentSearchResult, OrionDocument, OrionDocumentChunk } from "@/types/orion";

type WorkerInbound =
  | { type: "parse-text"; requestId: string; fileName: string; kind: DocumentKind; text: string }
  | { type: "chunk"; requestId: string; document: OrionDocument; chunkSize: number }
  | { type: "search"; requestId: string; query: string; chunks: OrionDocumentChunk[]; documents: OrionDocument[] };

type WorkerOutbound =
  | { type: "parsed"; requestId: string; content: string; previewText: string; wordCount: number; pageCount: number }
  | { type: "chunked"; requestId: string; chunks: OrionDocumentChunk[] }
  | { type: "search-results"; requestId: string; results: DocumentSearchResult[] }
  | { type: "error"; requestId: string; message: string };

const scope = self as DedicatedWorkerGlobalScope;
const post = (message: WorkerOutbound) => scope.postMessage(message);

function normalizeText(value: string) {
  return value.replace(/\r\n?|\u0000|[ \t]+(?=\n)/g, (match) => (match === "\u0000" ? "" : "\n")).trim();
}

function words(text: string) {
  return text.toLowerCase().match(/[a-z0-9_#.-]+/g) ?? [];
}

function uniqueKeywords(text: string) {
  const stop = new Set(["the", "and", "for", "with", "this", "that", "from", "are", "was", "were", "you", "your"]);
  return [...new Set(words(text).filter((word) => word.length > 2 && !stop.has(word)))].slice(0, 32);
}

function vectorize(text: string) {
  const vector = new Array<number>(32).fill(0);
  for (const word of words(text)) {
    let hash = 0;
    for (let index = 0; index < word.length; index += 1) {
      hash = (hash * 31 + word.charCodeAt(index)) >>> 0;
    }
    vector[hash % vector.length] += 1;
  }
  const magnitude = Math.hypot(...vector) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

function cosine(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
  }
  return dot;
}

function buildChunks(document: OrionDocument, chunkSize: number): OrionDocumentChunk[] {
  const paragraphs = document.content.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs.length > 0 ? paragraphs : [document.content]) {
    if ((current + "\n\n" + paragraph).trim().length > chunkSize && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = `${current}\n\n${paragraph}`.trim();
    }
  }

  if (current) {
    chunks.push(current.trim());
  }

  return chunks.map((content, index) => {
    const pageMatch = content.match(/\[page\s+(\d+)\]/iu);
    const sectionMatch = content.match(/^(#{1,6}\s+.+|[A-Z][^\n]{4,80})/u);
    const normalizedContent = normalizeText(content).toLowerCase();
    return {
      id: `${document.id}_chunk_${index}`,
      documentId: document.id,
      documentName: document.name,
      index,
      content,
      normalizedContent,
      tokenEstimate: Math.ceil(content.length / 4),
      wordCount: words(content).length,
      pageNumber: pageMatch ? Number(pageMatch[1]) : null,
      sectionTitle: sectionMatch?.[1]?.replace(/^#{1,6}\s+/u, "") ?? null,
      embeddingVector: vectorize(content),
      keywords: uniqueKeywords(content),
      createdAt: Date.now()
    };
  });
}

function excerptFor(content: string, terms: string[]) {
  const lower = content.toLowerCase();
  const first = terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, first - 100);
  const excerpt = content.slice(start, start + 360).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "... " : ""}${excerpt}${start + 360 < content.length ? " ..." : ""}`;
}

function search(query: string, chunks: OrionDocumentChunk[], documents: OrionDocument[]) {
  const terms = uniqueKeywords(query);
  const queryVector = vectorize(query);
  const documentMap = new Map(documents.map((document) => [document.id, document]));

  return chunks
    .map((chunk): DocumentSearchResult | null => {
      const keywordHits = terms.filter((term) => chunk.normalizedContent.includes(term));
      const keywordScore = keywordHits.length / Math.max(terms.length, 1);
      const semanticScore = cosine(queryVector, chunk.embeddingVector);
      const score = Number((keywordScore * 0.4 + semanticScore * 0.6).toFixed(4));
      if (score < 0.15 && keywordHits.length === 0) {
        return null;
      }
      const document = documentMap.get(chunk.documentId);
      return {
        id: `${chunk.id}_${query}`,
        documentId: chunk.documentId,
        documentName: document?.name ?? chunk.documentName,
        chunkId: chunk.id,
        chunkIndex: chunk.index,
        excerpt: excerptFor(chunk.content, terms),
        score,
        matchType: keywordHits.length > 0 && semanticScore > 0.12 ? "hybrid" : keywordHits.length > 0 ? "keyword" : "semantic",
        pageNumber: chunk.pageNumber,
        highlights: keywordHits
      };
    })
    .filter((result): result is DocumentSearchResult => Boolean(result))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

scope.onmessage = (event: MessageEvent<WorkerInbound>) => {
  try {
    if (event.data.type === "parse-text") {
      const content = normalizeText(event.data.text);
      post({
        type: "parsed",
        requestId: event.data.requestId,
        content,
        previewText: content.slice(0, 3000),
        wordCount: words(content).length,
        pageCount: 1
      });
      return;
    }

    if (event.data.type === "chunk") {
      post({ type: "chunked", requestId: event.data.requestId, chunks: buildChunks(event.data.document, event.data.chunkSize) });
      return;
    }

    if (event.data.type === "search") {
      post({
        type: "search-results",
        requestId: event.data.requestId,
        results: search(event.data.query, event.data.chunks, event.data.documents)
      });
    }
  } catch (error) {
    post({ type: "error", requestId: event.data.requestId, message: error instanceof Error ? error.message : "Document worker failed." });
  }
};
