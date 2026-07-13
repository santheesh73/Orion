"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { ArrowUp, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/useUpload";
import { m, AnimatePresence } from "framer-motion";

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
      <m.form 
        onSubmit={submit} 
        layout
        className="relative flex items-end overflow-hidden rounded-[26px] bg-secondary/60 focus-within:bg-secondary/80 focus-within:ring-1 focus-within:ring-primary/30 focus-within:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all duration-300"
      >
        <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-2 ml-2">
          <Button onClick={() => fileInputRef.current?.click()} aria-label="Attach" type="button" variant="ghost" size="icon" className={cn("h-10 w-10 shrink-0 rounded-full text-foreground hover:bg-background/50 transition-all", isUploading && "opacity-50 pointer-events-none")}>
            <Plus className={cn("size-5", isUploading && "animate-spin")} />
          </Button>
        </m.div>
        
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Orion..."
          rows={1}
          className="max-h-52 min-h-[56px] w-full resize-none bg-transparent px-2 py-4 text-base outline-none focus-visible:!outline-none placeholder:transition-opacity focus:placeholder:opacity-50 scrollbar-subtle transition-[height] duration-200"
          aria-label="Message Orion"
        />
        
        <div className="mb-2 mr-2 flex shrink-0 items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <m.div
                key="stop"
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Button aria-label="Stop generation" type="button" onClick={onStop} className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm">
                  <Square className="size-4 fill-current" />
                </Button>
              </m.div>
            ) : (
              <m.div
                key="send"
                initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button aria-label="Send message" type="submit" disabled={!canSubmit || !trimmed} className={cn("h-10 w-10 rounded-full transition-all shadow-sm", trimmed && canSubmit ? "bg-foreground text-background hover:bg-foreground/90" : "bg-muted text-muted-foreground")}>
                  <ArrowUp className="size-5" />
                </Button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.form>
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-center text-xs text-muted-foreground"
      >
        {guidance ?? "Orion runs locally and can make mistakes. Check important info."}
      </m.div>
    </div>
  );
}
