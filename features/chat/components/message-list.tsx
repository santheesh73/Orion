"use client";

import { AnimatePresence } from "framer-motion";
import { memo, useEffect, useRef } from "react";
import { EmptyState } from "@/features/chat/components/empty-state";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import { TypingIndicator } from "@/features/chat/components/typing-indicator";
import type { ChatUiMessage, QuickPrompt } from "@/features/chat/types/chat-ui";

export const MessageList = memo(function MessageList({
  messages,
  prompts,
  loading,
  onDeleteMessage,
  onSelectPrompt
}: {
  messages: ChatUiMessage[];
  prompts: QuickPrompt[];
  loading: boolean;
  onDeleteMessage: (id: string) => void;
  onSelectPrompt: (prompt: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  if (messages.length === 0) {
    return <EmptyState prompts={prompts} onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onDelete={onDeleteMessage} />
        ))}
        {loading ? <TypingIndicator key="typing" /> : null}
      </AnimatePresence>
      <div ref={endRef} className="h-1" />
    </div>
  );
});
