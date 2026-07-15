"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/types/orion";
import { LogoIcon } from "@/components/common/logo";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="grid min-h-[48vh] place-items-center px-6 text-center">
        <div className="max-w-xl">
          <div className="mx-auto flex size-14 items-center justify-center">
            <LogoIcon size={48} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">Ask privately. Think locally.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Load a model once, then keep working without a network connection. Chats stay in IndexedDB on this device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8">
      {messages.map((message) => (
        <article
          key={message.id}
          className={cn(
            "group flex gap-3 rounded-lg border border-border bg-card p-4",
            message.role === "user" && "bg-secondary/60"
          )}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-background">
            {message.role === "user" ? <UserRound className="size-4" /> : <LogoIcon size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase text-muted-foreground">{message.role}</span>
              <Button
                aria-label="Copy message"
                variant="ghost"
                size="sm"
                className="opacity-0 transition group-hover:opacity-100"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:rounded-md prose-pre:bg-zinc-950">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {message.content || "Thinking..."}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
