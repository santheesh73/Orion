"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "Thinking locally...",
  "Understanding your question...",
  "Searching local context...",
  "Generating response...",
  "Almost ready..."
];

export function TypingIndicator() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      className="flex flex-col items-center justify-center gap-4 py-8"
      aria-label="Orion is preparing a response"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex items-center justify-center size-14"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-teal-400/20 blur-xl"
        />
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[1.5px] border-t-blue-500/60 border-r-teal-400/60 border-b-transparent border-l-transparent"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-1.5 rounded-full border-[1.5px] border-b-blue-400/50 border-l-teal-300/50 border-t-transparent border-r-transparent"
        />

        <motion.div
          animate={{ scale: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="size-5 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
        />
      </motion.div>

      <div className="h-6 overflow-hidden relative w-64 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={statusIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"
          >
            {STATUS_MESSAGES[statusIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
