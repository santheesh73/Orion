"use client";

import { Check, Copy, Pencil, ThumbsDown, ThumbsUp, Trash2, RefreshCw, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MessageToolbar({
  content,
  onEdit,
  onDelete,
  isUser
}: {
  content: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isUser?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Button aria-label="Copy message" variant="ghost" size="sm" className="size-8 p-0" onClick={copyMessage}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      
      {!isUser ? (
        <>
          <Button aria-label="Like response" variant="ghost" size="sm" className="size-8 p-0">
            <ThumbsUp className="size-4" />
          </Button>
          <Button aria-label="Dislike response" variant="ghost" size="sm" className="size-8 p-0">
            <ThumbsDown className="size-4" />
          </Button>
          <Button aria-label="Regenerate response" variant="ghost" size="sm" className="size-8 p-0">
            <RefreshCw className="size-4" />
          </Button>
          <Button aria-label="More options" variant="ghost" size="sm" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <Button aria-label="Edit message" variant="ghost" size="sm" className="size-8 p-0" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button aria-label="Delete message" variant="ghost" size="sm" className="size-8 p-0 hover:text-error" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
