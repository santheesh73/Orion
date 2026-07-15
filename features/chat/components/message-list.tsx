"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { EmptyState } from "@/features/chat/components/empty-state";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import { TypingIndicator } from "@/features/chat/components/typing-indicator";
import type { ChatUiMessage, QuickPrompt } from "@/features/chat/types/chat-ui";
import { Button } from "@/components/ui/button";

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
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 150;
      setAutoScroll(isAtBottom);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading, autoScroll]);

  const jumpToLatest = () => {
    setAutoScroll(true);
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  if (messages.length === 0) {
    return <EmptyState prompts={prompts} onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 relative">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} onDelete={onDeleteMessage} isStreaming={loading && index === messages.length - 1} />
        ))}
        {loading ? <TypingIndicator key="typing" /> : null}
      </AnimatePresence>
      <div ref={endRef} className="h-4" />

      <AnimatePresence>
        {!autoScroll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50"
          >
            <Button onClick={jumpToLatest} variant="secondary" className="rounded-full shadow-lg border border-border/50 bg-background/90 backdrop-blur">
              Jump to latest <ArrowDown className="ml-2 size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
