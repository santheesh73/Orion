"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { localAiClient } from "@/features/ai/local-ai-client";
import { searchDocuments } from "@/services/document/search.service";
import { useOrionStore } from "@/store/orion-store";
import type { DocumentChatMessage, DocumentSearchResult, PromptMessage } from "@/types/orion";

function createMessage(role: DocumentChatMessage["role"], content: string, sourceChunkIds: string[] = []): DocumentChatMessage {
  return {
    id: `doc_chat_${crypto.randomUUID()}`,
    role,
    content,
    sourceChunkIds,
    createdAt: Date.now()
  };
}

export function useDocumentChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSources, setActiveSources] = useState<DocumentSearchResult[]>([]);
  const {
    documents,
    selectedDocumentIds,
    documentChatMessages,
    appendDocumentChatMessage,
    updateDocumentChatMessage,
    settings
  } = useOrionStore();

  useEffect(() => {
    return localAiClient.subscribe((event) => {
      if (event.type === "token") {
        const assistant = [...useOrionStore.getState().documentChatMessages].reverse().find((message) => {
          return message.role === "assistant" && message.content.startsWith("__streaming__");
        });
        if (assistant) {
          const current = assistant.content.replace("__streaming__", "");
          updateDocumentChatMessage(assistant.id, `__streaming__${current}${event.content}`);
        }
      }
      if (event.type === "done") {
        const assistant = [...useOrionStore.getState().documentChatMessages].reverse().find((message) => {
          return message.role === "assistant" && message.content.startsWith("__streaming__");
        });
        if (assistant) {
          updateDocumentChatMessage(assistant.id, assistant.content.replace("__streaming__", "").trim());
        }
        setIsGenerating(false);
      }
      if (event.type === "error") {
        setIsGenerating(false);
        toast.error(event.message);
      }
    });
  }, [updateDocumentChatMessage]);

  const visibleMessages = useMemo(
    () =>
      documentChatMessages.map((message) => ({
        ...message,
        content: message.content.replace("__streaming__", "")
      })),
    [documentChatMessages]
  );

  async function ask(prompt: string, mode: "ask" | "summarize" | "explain" | "key-points" | "actions" = "ask") {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) {
      return;
    }

    const scopedIds = selectedDocumentIds.length > 0 ? selectedDocumentIds : documents.map((document) => document.id);
    if (scopedIds.length === 0) {
      toast.error("Upload or select a document first.");
      return;
    }

    const retrievalQuery = mode === "summarize" ? "summary overview key points" : trimmed;
    const sources = await searchDocuments(retrievalQuery, scopedIds);
    const selectedSources = sources.slice(0, 8);
    setActiveSources(selectedSources);

    const context = selectedSources
      .map((source, index) => `[${index + 1}] ${source.documentName} ${source.pageNumber ? `page ${source.pageNumber}` : `chunk ${source.chunkIndex + 1}`}\n${source.excerpt}`)
      .join("\n\n");

    const modeInstruction = {
      ask: "Answer the user's question using only the provided local document context. Say when the context is insufficient.",
      summarize: "Summarize the selected local documents with clear sections and concise bullets.",
      explain: "Explain the relevant document material in plain language while staying faithful to the source.",
      "key-points": "Extract the most important key points from the selected local document context.",
      actions: "Extract action items, owners, dates, risks, and open questions from the selected local document context."
    }[mode];

    const userMessage = createMessage("user", trimmed);
    const assistantMessage = createMessage("assistant", "__streaming__", selectedSources.map((source) => source.chunkId));
    appendDocumentChatMessage(userMessage);
    appendDocumentChatMessage(assistantMessage);
    setIsGenerating(true);

    const messages: PromptMessage[] = [
      {
        role: "system",
        content: `${settings.systemPrompt}\n\nYou are working in Orion's Local Document Intelligence Engine. No cloud tools are available. ${modeInstruction}`
      },
      {
        role: "user",
        content: `Local document context:\n${context || "No relevant context was found."}\n\nUser request:\n${trimmed}`
      }
    ];

    localAiClient.generatePromptMessages(messages, settings);
  }

  return {
    messages: visibleMessages,
    isGenerating,
    activeSources,
    ask
  };
}
