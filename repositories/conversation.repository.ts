"use client";

import { db } from "@/lib/db/orion-db";
import type { ChatThread } from "@/types/orion";

export class ConversationRepository {
  async create(conversation: ChatThread) {
    await db.conversations.put(conversation);
    return conversation;
  }

  async getById(id: string) {
    return db.conversations.get(id);
  }

  async list({ includeDeleted = false, limit = 100, offset = 0 } = {}) {
    const rows = includeDeleted
      ? await db.conversations.orderBy("updatedAt").reverse().offset(offset).limit(limit).toArray()
      : await db.conversations.where("deleted").notEqual(1).reverse().sortBy("updatedAt");
    return rows.slice(offset, offset + limit);
  }

  async update(id: string, changes: Partial<ChatThread>) {
    await db.conversations.update(id, { ...changes, updatedAt: Date.now() });
    return db.conversations.get(id);
  }

  async softDelete(id: string) {
    await this.update(id, { deleted: true });
  }

  async hardDelete(id: string) {
    await db.transaction("rw", db.conversations, db.messages, db.statistics, async () => {
      await db.messages.where("chatId").equals(id).modify({ deleted: true, status: "deleted" });
      await db.statistics.where("conversationId").equals(id).delete();
      await db.conversations.delete(id);
    });
  }

  async search(query: string, limit = 50) {
    const needle = query.trim().toLowerCase();
    if (!needle) return this.list({ limit });
    const rows = await db.conversations.where("deleted").notEqual(1).toArray();
    return rows
      .filter((conversation) => {
        return (
          conversation.title.toLowerCase().includes(needle) ||
          (conversation.lastMessagePreview ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }
}

export const conversationRepository = new ConversationRepository();
