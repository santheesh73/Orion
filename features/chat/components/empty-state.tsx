"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { QuickPrompts } from "@/features/chat/components/quick-prompts";
import type { QuickPrompt } from "@/features/chat/types/chat-ui";

export function EmptyState({
  prompts,
  onSelectPrompt
}: {
  prompts: QuickPrompt[];
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-12 pb-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-8" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">What can I help with?</h1>
        <p className="mb-10 text-muted-foreground">Orion runs locally on your device. Your data never leaves.</p>
        <div className="mx-auto max-w-2xl">
          <QuickPrompts prompts={prompts} onSelect={onSelectPrompt} />
        </div>
      </motion.div>
    </div>
  );
}
