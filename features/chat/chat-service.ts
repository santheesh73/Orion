"use client";

import { db } from "@/lib/db/orion-db";
import type { ChatMessage, ChatThread, MessageRole } from "@/types/orion";

const now = () => Date.now();

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
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
  await db.messages.put(message);
  await db.conversations.update(chatId, { updatedAt: now(), lastMessagePreview: content.slice(0, 180) });
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
