"use client";

import { messageRepository } from "@/repositories/message.repository";
import { conversationService } from "@/services/database/conversation.service";
import { statisticsService } from "@/services/database/statistics.service";
import { createId, now } from "@/services/database/ids";
import type { ChatMessage, MessageRole } from "@/types/orion";

function tokenCount(content: string) {
  return Math.ceil(content.trim().length / 4);
}

export class MessageService {
  async create(chatId: string, role: MessageRole, content: string, extras: Partial<ChatMessage> = {}) {
    const timestamp = now();
    const message: ChatMessage = {
      id: createId("msg"),
      chatId,
      role,
      content,
      markdown: content,
      createdAt: timestamp,
      updatedAt: timestamp,
      generationTimeMs: extras.generationTimeMs ?? null,
      tokenCount: extras.tokenCount ?? tokenCount(content),
      status: extras.status ?? "complete",
      error: extras.error ?? null,
      deleted: false,
      ...extras
    };
    await messageRepository.create(message);
    await conversationService.updateAfterMessage(chatId, content);
    await statisticsService.touchWithMessage(message);
    return message;
  }

  async list(chatId: string, options?: { limit?: number; offset?: number; includeDeleted?: boolean }) {
    return messageRepository.listByConversation(chatId, options);
  }

  async updateContent(id: string, content: string, extras: Partial<ChatMessage> = {}) {
    const message = await messageRepository.update(id, {
      content,
      markdown: content,
      tokenCount: extras.tokenCount ?? tokenCount(content),
      status: extras.status ?? "complete",
      generationTimeMs: extras.generationTimeMs,
      error: extras.error ?? null
    });
    if (message) {
      await conversationService.updateAfterMessage(message.chatId, content);
      await statisticsService.touchWithMessage(message);
    }
    return message;
  }

  async markError(id: string, error: string) {
    return this.updateContent(id, error, { status: "error", error });
  }

  async softDelete(id: string) {
    const message = await messageRepository.getById(id);
    await messageRepository.softDelete(id);
    if (message) {
      await conversationService.updateAfterMessage(message.chatId, "");
    }
  }

  async search(query: string) {
    return messageRepository.search(query);
  }
}

export const messageService = new MessageService();
