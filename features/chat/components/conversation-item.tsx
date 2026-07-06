"use client";

import { MoreHorizontal, Pin, Star, MessageSquare } from "lucide-react";
import type { MouseEvent } from "react";
import type { Conversation } from "@/features/chat/types/chat-ui";
import { cn } from "@/lib/utils/cn";

export function ConversationItem({
  conversation,
  active,
  collapsed,
  onSelect,
  onContextMenu
}: {
  conversation: Conversation;
  active: boolean;
  collapsed: boolean;
  onSelect: () => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, conversation: Conversation) => void;
}) {
  return (
    <button
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
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {conversation.title}
          </span>
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
        </>
      ) : null}
    </button>
  );
}
