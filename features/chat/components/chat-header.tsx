"use client";

import { Command, Download, Info, MoreHorizontal, Pencil, Trash2, WifiOff, MessageSquarePlus } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Conversation } from "@/features/chat/types/chat-ui";

export function ChatHeader({
  conversation,
  modelName,
  backend,
  contextWindow,
  tokensPerSecond,
  status,
  onRename,
  onDelete,
  onExport,
  onInfo,
  onOpenCommand,
  onNewChat
}: {
  conversation: Conversation | undefined;
  modelName: string;
  backend: string;
  contextWindow: number;
  tokensPerSecond: number;
  status: string;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
  onInfo: () => void;
  onOpenCommand: () => void;
  onNewChat: () => void;
}) {
  return (
    <header className="relative z-50 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/82 px-4 backdrop-blur-xl sm:px-5">
      <div className="min-w-0 pl-12 lg:pl-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold sm:text-base">{conversation?.title ?? "New conversation"}</h1>
          <Button aria-label="Rename conversation" variant="ghost" size="icon" className="size-8" onClick={onRename}>
            <Pencil className="size-3.5" />
          </Button>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-caption text-muted-foreground">{modelName}</span>
          <span className="text-caption text-muted-foreground">{contextWindow.toLocaleString()} ctx</span>
          <span className="text-caption text-muted-foreground">{tokensPerSecond > 0 ? `${tokensPerSecond.toFixed(1)} tok/s` : status}</span>
          <Badge variant="success" className="gap-1">
            <WifiOff className="size-3" />
            {backend.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1">

        <Button aria-label="Open chat command palette" variant="ghost" size="icon" onClick={onOpenCommand}>
          <Command className="size-5" />
        </Button>
        <ThemeToggle />
        <DropdownMenu
          trigger={
            <Button aria-label="Open conversation menu" variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          }
        >
          <DropdownMenuItem onClick={onInfo}>
            <Info className="size-4" />
            Conversation info
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExport}>
            <Download className="size-4" />
            Export chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-error" onClick={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
