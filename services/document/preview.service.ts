"use client";

import type { DocumentSearchResult, OrionDocument } from "@/types/orion";

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function documentLanguage(document: OrionDocument) {
  const map: Partial<Record<OrionDocument["kind"], string>> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "csharp",
    go: "go",
    rust: "rust",
    kotlin: "kotlin",
    swift: "swift",
    yaml: "yaml",
    json: "json",
    xml: "xml",
    sql: "sql",
    html: "html",
    markdown: "markdown"
  };
  return map[document.kind] ?? "text";
}

export function highlightText(text: string, terms: string[]) {
  if (terms.length === 0) {
    return [{ text, highlight: false }];
  }
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
  if (escaped.length === 0) {
    return [{ text, highlight: false }];
  }
  const regex = new RegExp(`(${escaped.join("|")})`, "giu");
  return text.split(regex).filter(Boolean).map((part) => ({
    text: part,
    highlight: new RegExp(`^(${escaped.join("|")})$`, "iu").test(part)
  }));
}

export function searchResultLabel(result: DocumentSearchResult) {
  const page = result.pageNumber ? `Page ${result.pageNumber} · ` : "";
  return `${page}Chunk ${result.chunkIndex + 1}`;
}
