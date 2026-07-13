"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { CommandPalette as BaseCommandPalette } from "@/components/common/command-palette";
import type { Conversation } from "@/features/chat/types/chat-ui";
import { db } from "@/lib/db/orion-db";
import type { ChatMessage } from "@/types/orion";

export function ChatCommandPalette({
  open,
  conversations,
  onOpenChange,
  onSelectConversation,
  onNewChat,
  onOpenSettings
}: {
  open: boolean;
  conversations: Conversation[];
  onOpenChange: (open: boolean) => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [messageResults, setMessageResults] = useState<{ message: ChatMessage; chatTitle: string }[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setMessageResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const q = search.toLowerCase();
      const msgs = await db.messages.filter(m => m.content.toLowerCase().includes(q)).limit(5).toArray();
      const results = [];
      for (const m of msgs) {
        const chat = await db.conversations.get(m.chatId);
        if (chat && !chat.deleted) {
          results.push({ message: m, chatTitle: chat.title });
        }
      }
      setMessageResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle clearing search when closed
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const staticItems = useMemo(() => [
    {
      label: "New conversation",
      action: () => {
        onNewChat();
        onOpenChange(false);
      }
    },
    { label: "Open Models", action: () => router.push("/models") },
    { label: "Open Settings", action: onOpenSettings },
    { label: "Open About", action: () => router.push("/about") },
    { label: "Theme: Light", action: () => setTheme("light") },
    { label: "Theme: Dark", action: () => setTheme("dark") },
    { label: "Theme: System", action: () => setTheme("system") },
    ...conversations.slice(0, 6).map((conversation) => ({
      label: `Recent: ${conversation.title}`,
      action: () => {
        onSelectConversation(conversation.id);
        onOpenChange(false);
      }
    }))
  ], [conversations, onNewChat, onOpenChange, onOpenSettings, onSelectConversation, router, setTheme]);

  const items = search.trim() ? [
    ...staticItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
    ...messageResults.map(r => ({
      label: `Message in "${r.chatTitle}": ${r.message.content.slice(0, 50)}${r.message.content.length > 50 ? "..." : ""}`,
      action: () => {
        onSelectConversation(r.message.chatId);
        onOpenChange(false);
      }
    }))
  ] : staticItems;

  return (
    <BaseCommandPalette 
      open={open} 
      onOpenChange={onOpenChange} 
      items={items}
      search={search}
      onSearchChange={setSearch}
      shouldFilter={false}
    />
  );
}
