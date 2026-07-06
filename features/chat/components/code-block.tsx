"use client";

import { memo, useState } from "react";
import { Check, ChevronDown, Copy, WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const CodeBlock = memo(function CodeBlock({
  language,
  code
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-100 shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="text-caption font-medium uppercase text-zinc-300">{language || "code"}</span>
        <div className="flex items-center gap-1">
          <Button aria-label="Toggle code wrapping" variant="ghost" size="sm" className="h-8 text-zinc-200 hover:bg-white/10" onClick={() => setWrapped((value) => !value)}>
            <WrapText className="size-3.5" />
          </Button>
          <Button aria-label="Collapse code block" variant="ghost" size="sm" className="h-8 text-zinc-200 hover:bg-white/10" onClick={() => setCollapsed((value) => !value)}>
            <ChevronDown className={cn("size-3.5 transition", collapsed && "-rotate-90")} />
          </Button>
          <Button aria-label="Copy code" variant="ghost" size="sm" className="h-8 text-zinc-200 hover:bg-white/10" onClick={copyCode}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>
      {!collapsed ? (
        <pre className={cn("overflow-x-auto p-4 text-sm leading-6", wrapped && "whitespace-pre-wrap break-words")}>
          <code>{code}</code>
        </pre>
      ) : null}
    </div>
  );
});
