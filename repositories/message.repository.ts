"use client";

import { db } from "@/lib/db/orion-db";
import Dexie from "dexie";
import type { ChatMessage } from "@/types/orion";

export class MessageRepository {
  async create(message: ChatMessage) {
    await db.messages.put(message);
    return message;
  }

  async bulkCreate(messages: ChatMessage[]) {
    await db.messages.bulkPut(messages);
    return messages;
  }

  async getById(id: string) {
    return db.messages.get(id);
  }

  async listByConversation(chatId: string, { includeDeleted = false, limit = 200, offset = 0 } = {}) {
    const rows = await db.messages.where("[chatId+createdAt]").between([chatId, Dexie.minKey], [chatId, Dexie.maxKey]).toArray();
    return rows
      .filter((message) => includeDeleted || !message.deleted)
      .slice(offset, offset + limit);
  }

  async update(id: string, changes: Partial<ChatMessage>) {
    await db.messages.update(id, { ...changes, updatedAt: Date.now() });
    return db.messages.get(id);
  }

  async softDelete(id: string) {
    await this.update(id, { deleted: true, status: "deleted" });
  }

  async deleteByConversation(chatId: string) {
    await db.messages.where("chatId").equals(chatId).modify({ deleted: true, status: "deleted" });
  }

  async search(query: string, limit = 50) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const rows = await db.messages.where("deleted").notEqual(1).toArray();
    return rows
      .filter((message) => message.content.toLowerCase().includes(needle))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
}

export const messageRepository = new MessageRepository();
