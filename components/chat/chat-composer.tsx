"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  disabled,
  isGenerating,
  onSubmit
}: {
  disabled?: boolean;
  isGenerating: boolean;
  onSubmit: (prompt: string) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) {
      return;
    }
    await onSubmit(prompt);
    setPrompt("");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl px-4 pb-4">
      <div className="rounded-lg border border-border bg-card p-2 shadow-lg shadow-black/5">
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask Orion anything..."
          disabled={disabled || isGenerating}
          className="max-h-44 min-h-24 border-0 bg-transparent focus-visible:ring-0"
        />
        <div className="flex items-center justify-between border-t border-border px-2 pt-2">
          <span className="text-xs text-muted-foreground">Local-first. No remote inference.</span>
          <Button disabled={disabled || isGenerating || !prompt.trim()} type="submit">
            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isGenerating ? "Thinking" : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
}
