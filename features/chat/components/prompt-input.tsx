"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { ArrowUp, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/useUpload";

import { cn } from "@/lib/utils/cn";

export function PromptInput({
  value,
  loading,
  canRegenerate = false,
  canContinue = false,
  canSubmit = true,
  guidance,
  onChange,
  onSubmit,
  onClear,
  onStop,
  onRegenerate,
  onContinue
}: {
  value: string;
  loading: boolean;
  canRegenerate?: boolean;
  canContinue?: boolean;
  canSubmit?: boolean;
  guidance?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onStop: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, isUploading } = useUpload();
  const trimmed = value.trim();
  const approximateTokens = Math.ceil(trimmed.length / 4);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [value]);

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!trimmed || loading || !canSubmit) {
      return;
    }
    onSubmit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" && loading) {
      event.preventDefault();
      onStop();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 pb-6">
      <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files); }} />
      <motion.form 
        onSubmit={submit} 
        animate={{ 
          scale: loading ? 0.98 : 1,
          boxShadow: loading ? "0 0 15px rgba(56,189,248,0.15)" : "0 0 0px rgba(0,0,0,0)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("relative flex items-end overflow-hidden rounded-[26px] bg-secondary/60 transition-colors", !loading && "focus-within:bg-secondary/80")}
      >
        <Button onClick={() => fileInputRef.current?.click()} aria-label="Attach" type="button" variant="ghost" size="icon" className={cn("mb-2 ml-2 h-10 w-10 shrink-0 rounded-full text-foreground hover:bg-background/50 transition-all", isUploading && "opacity-50 pointer-events-none")}>
          <Plus className={cn("size-5", isUploading && "animate-spin")} />
        </Button>
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Orion..."
          rows={1}
          className="max-h-52 min-h-[56px] w-full resize-none bg-transparent px-2 py-4 text-base outline-none focus-visible:!outline-none placeholder:text-muted-foreground/80 scrollbar-subtle"
          aria-label="Message Orion"
        />
        <div className="mb-2 mr-2 flex shrink-0 items-center justify-center relative size-10">
          <AnimatePresence mode="popLayout" initial={false}>
            {loading ? (
              <motion.div
                key="stop"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Button aria-label="Stop generation" type="button" onClick={onStop} className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm">
                  <Square className="size-4 fill-current" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Button aria-label="Send message" type="submit" disabled={!canSubmit || !trimmed} className={cn("h-10 w-10 rounded-full transition-all shadow-sm", trimmed && canSubmit ? "bg-foreground text-background hover:bg-foreground/90" : "bg-muted text-muted-foreground")}>
                  <ArrowUp className="size-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.form>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        {guidance ?? "Orion runs locally and can make mistakes. Check important info."}
      </div>
    </div>
  );
}
