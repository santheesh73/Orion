"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { CommandPalette as BaseCommandPalette } from "@/components/common/command-palette";
import type { Conversation } from "@/features/chat/types/chat-ui";

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

  const items = [
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
  ];

  return <BaseCommandPalette open={open} onOpenChange={onOpenChange} items={items} />;
}
