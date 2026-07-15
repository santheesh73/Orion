"use client";

import { Copy, Download, Heart, Pencil, Pin, Trash2 } from "lucide-react";
import type { Conversation } from "@/features/chat/types/chat-ui";

export function ConversationContextMenu({
  conversation,
  x,
  y,
  onClose,
  onRename,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onExport
}: {
  conversation: Conversation | null;
  x: number;
  y: number;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  onToggleFavorite?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
}) {
  if (!conversation) {
    return null;
  }

  const items = [
    { label: "Rename", icon: Pencil, action: onRename },
    { label: "Duplicate", icon: Copy, action: onDuplicate ?? onClose },
    { label: conversation.pinned ? "Unpin" : "Pin", icon: Pin, action: onTogglePin ?? onClose },
    { label: conversation.favorite ? "Unfavorite" : "Favorite", icon: Heart, action: onToggleFavorite ?? onClose },
    { label: "Export", icon: Download, action: onExport ?? onClose },
    { label: "Delete", icon: Trash2, action: onDelete, danger: true }
  ];

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(event) => event.preventDefault()}>
      <div
        role="menu"
        className="absolute min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-floating-panel"
        style={{ left: x, top: y }}
        onClick={(event) => event.stopPropagation()}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm transition hover:bg-hover data-[danger=true]:text-error"
              data-danger={item.danger ? "true" : undefined}
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
