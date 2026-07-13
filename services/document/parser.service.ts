"use client";

import type { DocumentKind } from "@/types/orion";
import { documentWorkerClient } from "@/services/document/worker-client";

export interface ParsedDocumentContent {
  content: string;
  previewText: string;
  wordCount: number;
  pageCount: number;
}

const extensionKind: Record<string, DocumentKind> = {
  pdf: "pdf",
  docx: "docx",
  txt: "txt",
  md: "markdown",
  markdown: "markdown",
  csv: "csv",
  json: "json",
  html: "html",
  htm: "html",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  kt: "kotlin",
  kts: "kotlin",
  swift: "swift",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  sql: "sql",
  log: "log",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  bmp: "image",
  gif: "image"
};

export const supportedExtensions = Object.keys(extensionKind);

export function getDocumentKind(file: File): DocumentKind | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return extensionKind[extension] ?? null;
}

export function validateDocumentFile(file: File) {
  const kind = getDocumentKind(file);
  if (!kind) {
    return { ok: false as const, error: `${file.name} is not a supported document type.` };
  }
  if (file.size > 80 * 1024 * 1024) {
    return { ok: false as const, error: `${file.name} is larger than the local 80 MB safety limit.` };
  }
  return { ok: true as const, kind };
}

export async function parseDocumentFile(file: File, kind: DocumentKind): Promise<ParsedDocumentContent> {
  if (kind === "pdf") {
    return parsePdf(file);
  }
  if (kind === "docx") {
    return parseDocx(file);
  }
  if (kind === "csv") {
    return parseCsv(file);
  }
  if (kind === "image") {
    return parseImage(file);
  }
  const text = await file.text();
  return documentWorkerClient.parseText({ fileName: file.name, kind, text });
}

async function parsePdf(file: File): Promise<ParsedDocumentContent> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(`[page ${pageNumber}]\n${text}`);
  }

  const content = pages.join("\n\n").trim();
  return {
    content,
    previewText: content.slice(0, 3000),
    wordCount: countWords(content),
    pageCount: pdf.numPages
  };
}

async function parseDocx(file: File): Promise<ParsedDocumentContent> {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const content = result.value.replace(/\r\n?/g, "\n").trim();
  return {
    content,
    previewText: content.slice(0, 3000),
    wordCount: countWords(content),
    pageCount: 1
  };
}

async function parseCsv(file: File): Promise<ParsedDocumentContent> {
  const Papa = await import("papaparse");
  const text = await file.text();
  const parsed = Papa.parse<string[]>(text, {
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(parsed.errors[0]?.message ?? "Could not parse this CSV file locally.");
  }

  const rows = parsed.data.filter((row) => row.some((cell) => String(cell ?? "").trim()));
  const content = rows.map((row) => row.map((cell) => String(cell ?? "").trim()).join(" | ")).join("\n");
  const previewRows = rows.slice(0, 80);
  const previewText = toMarkdownTable(previewRows) || content.slice(0, 3000);

  return {
    content,
    previewText,
    wordCount: countWords(content),
    pageCount: 1
  };
}

function toMarkdownTable(rows: string[][]) {
  if (rows.length === 0) {
    return "";
  }
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => Array.from({ length: width }, (_, index) => String(row[index] ?? "").trim()));
  const [header, ...body] = normalized;
  const safeHeader = header.map((cell, index) => cell || `Column ${index + 1}`);
  return [
    `| ${safeHeader.join(" | ")} |`,
    `| ${safeHeader.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

function countWords(text: string) {
  return text.match(/\b[\w'-]+\b/g)?.length ?? 0;
}

async function parseImage(file: File): Promise<ParsedDocumentContent> {
  const { ocrClient } = await import("@/services/document/ocr-client");
  const result = await ocrClient.recognize(file);
  const content = result.text.trim();
  const metadata = [
    `File: ${file.name}`,
    `Type: ${file.type}`,
    `Size: ${(file.size / 1024).toFixed(1)} KB`,
    `Dimensions: ${result.width}x${result.height}`
  ].join("\n");
  
  const fullContent = `[IMAGE METADATA]\n${metadata}\n\n[OCR TEXT EXTRACTION]\n${content}`;
  
  return {
    content: fullContent,
    previewText: fullContent.slice(0, 3000),
    wordCount: countWords(fullContent),
    pageCount: 1
  };
}
