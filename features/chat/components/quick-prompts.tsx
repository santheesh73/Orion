"use client";

import { m } from "framer-motion";
import { FileText, Languages, Lightbulb, ListChecks, PencilRuler, Sparkles } from "lucide-react";
import type { QuickPrompt } from "@/features/chat/types/chat-ui";

const icons = [Sparkles, ListChecks, PencilRuler, Lightbulb, Languages, FileText];

export function QuickPrompts({
  prompts,
  onSelect
}: {
  prompts: QuickPrompt[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt, index) => {
        const Icon = icons[index % icons.length];
        return (
          <m.button
            key={prompt.title}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            className="rounded-lg border border-border bg-card p-4 text-left shadow-soft transition hover:border-primary/30 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            onClick={() => onSelect(prompt.prompt)}
          >
            <Icon className="size-5 text-primary" />
            <span className="mt-3 block text-sm font-semibold">{prompt.title}</span>
            <span className="mt-1 block text-caption leading-5 text-muted-foreground">{prompt.description}</span>
          </m.button>
        );
      })}
    </div>
  );
}
