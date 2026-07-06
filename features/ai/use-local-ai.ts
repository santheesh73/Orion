"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { addMessage, updateMessageContent } from "@/features/chat/chat-service";
import { localAiClient } from "@/features/ai/local-ai-client";
import { useOrionStore } from "@/store/orion-store";
import type { ChatMessage } from "@/types/orion";

export function useLocalAi() {
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    activeChatId,
    messages,
    selectedModelId,
    settings,
    appendMessage,
    updateMessage,
    setModelProgress
  } = useOrionStore();

  useEffect(() => {
    return localAiClient.subscribe((event) => {
      if (event.type === "progress") {
        setModelProgress({ status: "loading", progress: event.progress, message: event.message });
      }

      if (event.type === "ready") {
        setModelProgress({ status: "ready", progress: 100, message: "Ready offline" });
        toast.success("Local model ready");
      }

      if (event.type === "token") {
        const assistant = [...useOrionStore.getState().messages].reverse().find((message) => {
          return message.role === "assistant" && message.content.startsWith("__streaming__");
        });

        if (assistant) {
          const current = assistant.content.replace("__streaming__", "");
          updateMessage(assistant.id, `__streaming__${current}${event.content}`);
        }
      }

      if (event.type === "done") {
        const state = useOrionStore.getState();
        const assistant = [...state.messages].reverse().find((message) => {
          return message.role === "assistant" && message.content.startsWith("__streaming__");
        });
        if (assistant) {
          const content = assistant.content.replace("__streaming__", "");
          updateMessage(assistant.id, content.trim());
          void updateMessageContent(assistant.id, content.trim());
        }
        setIsGenerating(false);
      }

      if (event.type === "error") {
        setModelProgress({ status: "error", progress: 0, message: event.message });
        setIsGenerating(false);
        toast.error(event.message);
      }
    });
  }, [setModelProgress, updateMessage]);

  const visibleMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        content: message.content.replace("__streaming__", "")
      })),
    [messages]
  );

  async function loadModel() {
    setModelProgress({ status: "loading", progress: 0, message: "Starting local model download" });
    localAiClient.load(selectedModelId);
  }

  async function sendPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!activeChatId || !trimmed || isGenerating) {
      return;
    }

    const userMessage = await addMessage(activeChatId, "user", trimmed);
    appendMessage(userMessage);

    const assistantMessage: ChatMessage = await addMessage(activeChatId, "assistant", "__streaming__");
    appendMessage(assistantMessage);

    setIsGenerating(true);
    localAiClient.generate([...messages, userMessage], settings);
  }

  return {
    isGenerating,
    messages: visibleMessages,
    loadModel,
    sendPrompt
  };
}
