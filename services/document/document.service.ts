"use client";

import { db } from "@/lib/db/orion-db";
import { createId, now } from "@/services/database/ids";
import { chunkDocument } from "@/services/document/chunk.service";
import { embeddingService } from "@/services/document/embedding.service";
import { parseDocumentFile, validateDocumentFile } from "@/services/document/parser.service";
import type { DocumentFolder, OrionDocument } from "@/types/orion";

export interface UploadProgressEvent {
  fileName: string;
  documentId: string;
  status: OrionDocument["status"];
  progress: number;
  message: string;
}

export type UploadProgressHandler = (event: UploadProgressEvent) => void;

class DocumentService {
  async list() {
    return db.documents.orderBy("updatedAt").reverse().toArray();
  }

  async get(id: string) {
    return db.documents.get(id);
  }

  async chunks(documentId: string) {
    return db.documentChunks.where("documentId").equals(documentId).sortBy("index");
  }

  async upload(files: File[], onProgress?: UploadProgressHandler) {
    const uploaded: OrionDocument[] = [];

    for (const file of files) {
      const document = await this.uploadOne(file, onProgress);
      uploaded.push(document);
    }

    return uploaded;
  }

  async uploadOne(file: File, onProgress?: UploadProgressHandler) {
    const timestamp = now();
    const documentId = createId("doc");
    const progress = (status: OrionDocument["status"], value: number, message: string) => {
      onProgress?.({ fileName: file.name, documentId, status, progress: value, message });
    };

    progress("validating", 8, "Validating file");
    const validation = validateDocumentFile(file);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const baseDocument: OrionDocument = {
      id: documentId,
      name: file.name,
      kind: validation.kind,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      content: "",
      previewText: "",
      wordCount: 0,
      pageCount: 0,
      chunkCount: 0,
      tags: [],
      folderId: null,
      favorite: false,
      pinned: false,
      status: "parsing",
      progress: 18,
      error: null,
      lastOpenedAt: timestamp,
      binary: file,
      createdAt: timestamp,
      updatedAt: timestamp,
      modifiedAt: file.lastModified || timestamp
    };
    await db.documents.put(baseDocument);

    try {
      progress("parsing", 34, "Extracting text locally");
      const parsed = await parseDocumentFile(file, validation.kind);
      const parsedDocument = {
        ...baseDocument,
        ...parsed,
        status: "chunking" as const,
        progress: 58,
        updatedAt: now()
      };
      await db.documents.put(parsedDocument);

      progress("chunking", 66, "Splitting into searchable chunks");
      const chunks = await chunkDocument(parsedDocument);
      progress("indexing", 82, "Preparing local search index");
      const embeddedChunks = await embeddingService.prepare(chunks);

      await db.transaction("rw", db.documents, db.documentChunks, async () => {
        await db.documentChunks.where("documentId").equals(documentId).delete();
        if (embeddedChunks.length > 0) {
          await db.documentChunks.bulkPut(embeddedChunks);
        }
        await db.documents.update(documentId, {
          chunkCount: embeddedChunks.length,
          status: "ready",
          progress: 100,
          updatedAt: now()
        });
      });

      progress("ready", 100, "Ready");
      const readyDocument = await db.documents.get(documentId);
      if (!readyDocument) {
        throw new Error("Document was not saved.");
      }
      return readyDocument;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not process this document locally.";
      await db.documents.update(documentId, { status: "error", error: message, progress: 100, updatedAt: now() });
      progress("error", 100, message);
      throw new Error(message);
    }
  }

  async rename(id: string, name: string) {
    const trimmedName = name.trim() || "Untitled document";
    return db.transaction("rw", db.documents, db.documentChunks, async () => {
      await db.documents.update(id, { name: trimmedName, updatedAt: now() });
      await db.documentChunks.where("documentId").equals(id).modify({ documentName: trimmedName });
      return db.documents.get(id);
    });
  }

  async setFavorite(id: string, favorite: boolean) {
    await db.documents.update(id, { favorite, updatedAt: now() });
  }

  async setPinned(id: string, pinned: boolean) {
    await db.documents.update(id, { pinned, updatedAt: now() });
  }

  async updateTags(id: string, tags: string[]) {
    await db.documents.update(id, { tags: [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))], updatedAt: now() });
  }

  async moveToFolder(id: string, folderId: string | null) {
    await db.documents.update(id, { folderId, updatedAt: now() });
  }

  async delete(id: string) {
    await db.transaction("rw", db.documents, db.documentChunks, async () => {
      await db.documentChunks.where("documentId").equals(id).delete();
      await db.documents.delete(id);
    });
  }

  async markOpened(id: string) {
    await db.documents.update(id, { lastOpenedAt: now() });
  }

  async folders() {
    return db.documentFolders.orderBy("name").toArray();
  }

  async createFolder(name: string): Promise<DocumentFolder> {
    const timestamp = now();
    const folder = { id: createId("doc_folder"), name: name.trim() || "New folder", createdAt: timestamp, updatedAt: timestamp };
    await db.documentFolders.add(folder);
    return folder;
  }
}

export const documentService = new DocumentService();
