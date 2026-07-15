"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { AlertTriangle, Bot, Info, UserRound, Loader2 } from "lucide-react";
const MarkdownRenderer = dynamic(
  () => import("@/features/chat/components/markdown-renderer").then((mod) => mod.MarkdownRenderer),
  { ssr: false, loading: () => <div className="flex animate-pulse items-center gap-2 py-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Rendering...</div> }
);
import { MessageToolbar } from "@/features/chat/components/message-toolbar";
import type { ChatUiMessage } from "@/features/chat/types/chat-ui";
import { cn } from "@/lib/utils/cn";
import { LogoIcon } from "@/components/common/logo";

const roleStyles = {
  user: "bg-secondary/80",
  assistant: "bg-card",
  system: "bg-primary/10 border-primary/20",
  error: "bg-error/10 border-error/20"
};

const roleIcons = {
  user: UserRound,
  assistant: Bot,
  system: Info,
  error: AlertTriangle
};

export const MessageBubble = memo(function MessageBubble({
  message,
  onDelete,
  isStreaming
}: {
  message: ChatUiMessage;
  onDelete: (id: string) => void;
  isStreaming?: boolean;
}) {
  const Icon = roleIcons[message.role];
  const isUser = message.role === "user";
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    if (isStreaming === false && !isUser) {
      setJustFinished(true);
      const timer = setTimeout(() => setJustFinished(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isUser]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, filter: "blur(8px)", scale: 0.98 }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.8 }}
      className={cn("group flex gap-4 w-full", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <div className="mt-1 flex size-9 shrink-0 select-none items-center justify-center">
          <LogoIcon size={36} />
        </div>
      )}
      <div className={cn("relative flex max-w-[80%] flex-col", isUser ? "items-end" : "min-w-0 flex-1")}>
        <motion.div 
          animate={justFinished ? { scale: [1, 1.01, 1], transition: { duration: 0.4 } } : {}}
          className={cn(isUser ? "rounded-3xl bg-secondary px-5 py-3 text-foreground" : "py-1")}
        >
          {!isUser && (
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-foreground">{message.author}</p>
            </div>
          )}
          
          {message.imageUrl ? (
            <div className="mb-4 aspect-video overflow-hidden rounded-xl border border-border/50 bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={message.imageUrl} alt="" className="size-full object-cover" />
            </div>
          ) : null}
          
          <div className="prose-sm sm:prose-base dark:prose-invert" aria-live={isStreaming ? "polite" : "off"}>
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          </div>

          {!isUser && !isStreaming && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 flex flex-wrap gap-2"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-2.5 py-1 text-[0.65rem] font-medium text-success shadow-sm">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} className="size-1.5 rounded-full bg-success" />
                Running Locally
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-2.5 py-1 text-[0.65rem] font-medium text-success shadow-sm">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="size-1.5 rounded-full bg-success" />
                WebGPU
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-2.5 py-1 text-[0.65rem] font-medium text-success shadow-sm">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }} className="size-1.5 rounded-full bg-success" />
                Offline Ready
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className={cn("flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100", isUser ? "mt-1 justify-end pr-2" : "mt-2")}>
          <MessageToolbar content={message.content} onDelete={() => onDelete(message.id)} isUser={isUser} />
        </div>
      </div>
    </motion.article>
  );
});
