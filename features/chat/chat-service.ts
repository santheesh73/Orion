"use client";

import { db } from "@/lib/db/orion-db";
import type { ChatMessage, ChatThread, MessageRole } from "@/types/orion";

const now = () => Date.now();

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function cleanupEmptyChats(activeId: string) {
  const all = await db.conversations.toArray();
  const empty = all.filter(c => c.messageCount === 0 && c.title === "New conversation" && c.id !== activeId);
  if (empty.length > 0) {
    await db.conversations.bulkDelete(empty.map(c => c.id));
  }
}

export async function ensureChat(title = "New conversation") {
  const chat: ChatThread = {
    id: createId("chat"),
    title,
    createdAt: now(),
    updatedAt: now(),
    pinned: false,
    favorite: false,
    folderId: null,
    messageCount: 0,
    modelUsed: null,
    lastMessagePreview: "",
    deleted: false
  };
  await db.conversations.put(chat);
  return chat;
}

export async function addMessage(chatId: string, role: MessageRole, content: string) {
  const message: ChatMessage = {
    id: createId("msg"),
    chatId,
    role,
    content,
    createdAt: now()
  };

  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.messages.put(message);
    const chat = await db.conversations.get(chatId);
    if (chat) {
      const isFirstUserMessage = (chat.messageCount ?? 0) === 0 && role === "user";
      const updates: any = { 
        updatedAt: now(), 
        lastMessagePreview: content.slice(0, 180),
        messageCount: (chat.messageCount ?? 0) + 1
      };

      if (isFirstUserMessage && chat.title === "New conversation") {
        updates.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
      }

      await db.conversations.update(chatId, updates);
    }
  });

  return message;
}

export async function renameChat(chatId: string, title: string) {
  await db.conversations.update(chatId, { title, updatedAt: now() });
}

export async function deleteChat(chatId: string) {
  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.messages.where("chatId").equals(chatId).delete();
    await db.conversations.delete(chatId);
  });
}

export async function updateMessageContent(messageId: string, content: string) {
  await db.messages.update(messageId, { content });
}

export async function duplicateChat(chatId: string): Promise<ChatThread> {
  const original = await db.conversations.get(chatId);
  if (!original) throw new Error("Conversation not found");

  const newId = createId("chat");
  const duplicatedThread: ChatThread = {
    ...original,
    id: newId,
    title: original.title.endsWith(" (Copy)") ? original.title : `${original.title} (Copy)`,
    createdAt: now(),
    updatedAt: now(),
  };

  const originalMessages = await db.messages.where("chatId").equals(chatId).sortBy("createdAt");
  const duplicatedMessages = originalMessages.map(msg => ({
    ...msg,
    id: createId("msg"),
    chatId: newId,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt ? now() : undefined,
  }));

  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.conversations.put(duplicatedThread);
    if (duplicatedMessages.length > 0) {
      await db.messages.bulkPut(duplicatedMessages);
    }
  });

  return duplicatedThread;
}

