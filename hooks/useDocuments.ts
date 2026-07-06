"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { documentService } from "@/services/document/document.service";
import { useOrionStore } from "@/store/orion-store";
import type { DocumentFolder, OrionDocument } from "@/types/orion";

export function useDocuments() {
  const { documents, selectedDocumentIds, setDocuments, setSelectedDocumentIds, upsertDocument, removeDocument } = useOrionStore();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextDocuments, nextFolders] = await Promise.all([documentService.list(), documentService.folders()]);
      setDocuments(nextDocuments);
      setFolders(nextFolders);
    } finally {
      setLoading(false);
    }
  }, [setDocuments]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedDocuments = useMemo(
    () => documents.filter((document) => selectedDocumentIds.includes(document.id)),
    [documents, selectedDocumentIds]
  );

  function toggleSelected(documentId: string) {
    setSelectedDocumentIds(
      selectedDocumentIds.includes(documentId)
        ? selectedDocumentIds.filter((id) => id !== documentId)
        : [...selectedDocumentIds, documentId]
    );
  }

  async function rename(document: OrionDocument, name: string) {
    const updated = await documentService.rename(document.id, name);
    if (updated) {
      upsertDocument(updated);
    }
  }

  async function setFavorite(document: OrionDocument, favorite: boolean) {
    await documentService.setFavorite(document.id, favorite);
    upsertDocument({ ...document, favorite, updatedAt: Date.now() });
  }

  async function setPinned(document: OrionDocument, pinned: boolean) {
    await documentService.setPinned(document.id, pinned);
    upsertDocument({ ...document, pinned, updatedAt: Date.now() });
  }

  async function updateTags(document: OrionDocument, tags: string[]) {
    await documentService.updateTags(document.id, tags);
    upsertDocument({ ...document, tags: [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))], updatedAt: Date.now() });
  }

  async function moveToFolder(document: OrionDocument, folderId: string | null) {
    await documentService.moveToFolder(document.id, folderId);
    upsertDocument({ ...document, folderId, updatedAt: Date.now() });
  }

  async function createFolder(name: string) {
    const folder = await documentService.createFolder(name);
    setFolders((current) => [...current, folder].sort((a, b) => a.name.localeCompare(b.name)));
    return folder;
  }

  async function deleteDocument(documentId: string) {
    await documentService.delete(documentId);
    removeDocument(documentId);
    toast.success("Document deleted");
  }

  return {
    documents,
    folders,
    selectedDocumentIds,
    selectedDocuments,
    loading,
    refresh,
    toggleSelected,
    setSelectedDocumentIds,
    rename,
    setFavorite,
    setPinned,
    updateTags,
    moveToFolder,
    createFolder,
    deleteDocument
  };
}
