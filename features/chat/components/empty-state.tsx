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
    <div className="mx-auto grid min-h-full w-full max-w-4xl place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
        <h1 className="text-3xl font-semibold text-foreground">What can I help with?</h1>
      </motion.div>
    </div>
  );
}
