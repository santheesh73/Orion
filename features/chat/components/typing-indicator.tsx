"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex w-max items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3 shadow-soft"
      aria-label="Orion is preparing a response"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.2 }}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-primary">Thinking...</span>
    </motion.div>
  );
}
