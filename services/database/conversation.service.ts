"use client";

import { conversationRepository } from "@/repositories/conversation.repository";
import { messageRepository } from "@/repositories/message.repository";
import { statisticsService } from "@/services/database/statistics.service";
import { createId, now } from "@/services/database/ids";
import type { ChatThread } from "@/types/orion";

export class ConversationService {
  async create(title = "New conversation", modelUsed?: string | null) {
    const timestamp = now();
    return conversationRepository.create({
      id: createId("chat"),
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
      pinned: false,
      favorite: false,
      folderId: null,
      messageCount: 0,
      modelUsed: modelUsed ?? null,
      lastMessagePreview: "",
      deleted: false
    });
  }

  async list(options?: { limit?: number; offset?: number; includeDeleted?: boolean }) {
    return conversationRepository.list(options);
  }

  async get(id: string) {
    return conversationRepository.getById(id);
  }

  async rename(id: string, title: string) {
    return conversationRepository.update(id, { title: title.trim() || "Untitled conversation" });
  }

  async setPinned(id: string, pinned: boolean) {
    return conversationRepository.update(id, { pinned });
  }

  async setFavorite(id: string, favorite: boolean) {
    return conversationRepository.update(id, { favorite });
  }

  async moveToFolder(id: string, folderId: string | null) {
    return conversationRepository.update(id, { folderId });
  }

  async softDelete(id: string) {
    await conversationRepository.softDelete(id);
  }

  async updateAfterMessage(conversationId: string, preview: string, modelUsed?: string | null) {
    const messages = await messageRepository.listByConversation(conversationId, { limit: 10000 });
    await conversationRepository.update(conversationId, {
      messageCount: messages.length,
      lastMessagePreview: preview.slice(0, 180),
      modelUsed: modelUsed ?? undefined
    });
    await statisticsService.recompute(conversationId);
  }

  async search(query: string) {
    return conversationRepository.search(query);
  }

  async exportConversation(id: string, format: "json" | "markdown" | "txt") {
    const conversation = await conversationRepository.getById(id);
    const messages = await messageRepository.listByConversation(id, { limit: 10000 });
    if (!conversation) {
      throw new Error("Conversation not found.");
    }
    if (format === "json") {
      return JSON.stringify({ conversation, messages }, null, 2);
    }
    if (format === "txt") {
      return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
    }
    return [`# ${conversation.title}`, "", ...messages.map((message) => `## ${message.role}\n\n${message.content}`)].join("\n\n");
  }

  normalize(conversation: ChatThread) {
    return {
      ...conversation,
      folderId: conversation.folderId ?? null,
      messageCount: conversation.messageCount ?? 0,
      modelUsed: conversation.modelUsed ?? null,
      lastMessagePreview: conversation.lastMessagePreview ?? "",
      deleted: conversation.deleted ?? false
    };
  }
}

export const conversationService = new ConversationService();
