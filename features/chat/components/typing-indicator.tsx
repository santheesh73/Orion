"use client";

import { m } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function TypingIndicator() {
  const [text, setText] = useState("Thinking locally...");

  useEffect(() => {
    const timer = setTimeout(() => setText("Generating response..."), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <m.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex w-max items-center gap-4 rounded-2xl border border-primary/20 bg-surface/80 p-3 pr-5 shadow-floating-panel backdrop-blur-md"
      aria-label="Orion is preparing a response"
    >
      <div className="relative flex size-8 items-center justify-center">
        <m.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent opacity-70"
        />
        <m.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-md"
        />
        <Sparkles className="size-4 text-primary relative z-10" />
      </div>
      
      <div className="flex flex-col gap-0.5">
        <m.span 
          key={text}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          {text}
        </m.span>
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <m.span
              key={dot}
              className="size-1 rounded-full bg-primary/60"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </m.div>
  );
}
