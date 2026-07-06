"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { documentService } from "@/services/document/document.service";
import { useOrionStore } from "@/store/orion-store";

export function useUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { upsertDocument, setDocumentProcessing, clearDocumentProcessing } = useOrionStore();

  const uploadFiles = useCallback(
    async (input: FileList | File[]) => {
      const files = Array.from(input);
      if (files.length === 0) {
        return;
      }

      setIsUploading(true);
      let readyCount = 0;
      const failed: string[] = [];
      const processingIds = new Set<string>();
      try {
        for (const file of files) {
          try {
            const document = await documentService.uploadOne(file, (event) => {
              processingIds.add(event.documentId);
              setDocumentProcessing(event.documentId, {
                status: event.status,
                progress: event.progress,
                message: `${event.fileName}: ${event.message}`
              });
            });
            readyCount += 1;
            upsertDocument(document);
            clearDocumentProcessing(document.id);
          } catch (error) {
            failed.push(error instanceof Error ? error.message : `${file.name} could not be processed locally.`);
          }
        }
        processingIds.forEach((id) => clearDocumentProcessing(id));
        if (readyCount > 0) {
          toast.success(`${readyCount} document${readyCount === 1 ? "" : "s"} ready`);
        }
        if (failed.length > 0) {
          toast.error(failed.slice(0, 2).join(" "));
        }
      } finally {
        setIsUploading(false);
      }
    },
    [clearDocumentProcessing, setDocumentProcessing, upsertDocument]
  );

  return {
    isDragging,
    isUploading,
    setIsDragging,
    uploadFiles
  };
}
