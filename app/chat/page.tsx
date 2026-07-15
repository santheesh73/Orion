import type { Metadata } from "next";
import ChatLayoutDynamic from "@/features/chat/components/chat-layout-client";

export const metadata: Metadata = {
  title: "Chat - Orion",
  description: "A premium UI-only chat interface for Orion's on-device AI workspace."
};

export default function ChatPage() {
  return <ChatLayoutDynamic />;
}
