export type ChatMessageRole = "system" | "user" | "assistant" | "error";

export interface ChatUiMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  author: string;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  group: "Today" | "Yesterday" | "Previous 7 Days" | "Previous 30 Days";
  pinned?: boolean;
  favorite?: boolean;
  messageCount: number;
}

export interface QuickPrompt {
  title: string;
  prompt: string;
  description: string;
}
