"use client";

import { MoreHorizontal, Pin, Star, MessageSquare } from "lucide-react";
import type { MouseEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Conversation } from "@/features/chat/types/chat-ui";
import { cn } from "@/lib/utils/cn";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function ConversationItem({
  conversation,
  active,
  collapsed,
  onSelect,
  onContextMenu,
  isEditing,
  onRenameSave,
  onRenameCancel,
  onStartEdit,
  searchQuery
}: {
  conversation: Conversation;
  active: boolean;
  collapsed: boolean;
  onSelect: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, conversation: Conversation) => void;
  isEditing?: boolean;
  onRenameSave?: (title: string) => void;
  onRenameCancel?: () => void;
  onStartEdit?: () => void;
  searchQuery?: string;
}) {
  const [val, setVal] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setVal(conversation.title);
    }
  }, [isEditing, conversation.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (val.trim() && onRenameSave) {
        onRenameSave(val.trim());
      } else if (onRenameCancel) {
        onRenameCancel();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (onRenameCancel) onRenameCancel();
    }
  };

  const handleBlur = () => {
    if (val.trim() && onRenameSave) {
      onRenameSave(val.trim());
    } else if (onRenameCancel) {
      onRenameCancel();
    }
  };

  return (
    <motion.button
      layout
      type="button"
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        active && "bg-secondary text-foreground",
        collapsed && "justify-center px-2"
      )}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
      onContextMenu={(event) => onContextMenu(event, conversation)}
    >
      <span className="shrink-0 text-muted-foreground flex items-center justify-center">
        {conversation.pinned ? (
          <Pin className="size-4 text-primary" />
        ) : conversation.favorite ? (
          <Star className="size-4 fill-warning text-warning" />
        ) : (
          <MessageSquare className="size-4" />
        )}
      </span>
      {!collapsed ? (
        <>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="min-w-0 flex-1 bg-background text-sm font-medium border border-border rounded px-1 outline-none focus:ring-1 focus:ring-focus focus:border-focus"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          ) : (
            <span
              className="min-w-0 flex-1 truncate text-sm font-medium"
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onStartEdit) onStartEdit();
              }}
            >
              <Highlight text={conversation.title} query={searchQuery ?? ""} />
            </span>
          )}
          {!isEditing && (
            <div
              role="button"
              tabIndex={0}
              aria-label="Options"
              className="ml-auto flex size-6 items-center justify-center rounded-md opacity-0 transition hover:bg-black/10 hover:text-foreground group-hover:opacity-100 text-muted-foreground shrink-0 dark:hover:bg-white/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onContextMenu(e as unknown as MouseEvent<HTMLButtonElement>, conversation);
              }}
            >
              <MoreHorizontal className="size-4" />
            </div>
          )}
        </>
      ) : null}
    </motion.button>
  );
}
