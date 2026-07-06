"use client";

import { db } from "@/lib/db/orion-db";
import type { ChatMessage, ConversationStatistics } from "@/types/orion";

export class StatisticsService {
  async recompute(conversationId: string) {
    const messages = (await db.messages.where("chatId").equals(conversationId).toArray()).filter((message) => !message.deleted);
    const assistantMessages = messages.filter((message) => message.role === "assistant");
    const generationTimes = assistantMessages
      .map((message) => message.generationTimeMs ?? null)
      .filter((time): time is number => typeof time === "number");
    const stats: ConversationStatistics = {
      id: conversationId,
      conversationId,
      messageCount: messages.length,
      userMessageCount: messages.filter((message) => message.role === "user").length,
      assistantMessageCount: assistantMessages.length,
      totalTokens: messages.reduce((total, message) => total + (message.tokenCount ?? Math.ceil(message.content.length / 4)), 0),
      averageGenerationTimeMs:
        generationTimes.length > 0 ? Math.round(generationTimes.reduce((total, time) => total + time, 0) / generationTimes.length) : 0,
      lastActiveAt: messages.at(-1)?.createdAt ?? Date.now()
    };
    await db.statistics.put(stats);
    return stats;
  }

  async list() {
    return db.statistics.orderBy("lastActiveAt").reverse().toArray();
  }

  async touchWithMessage(message: ChatMessage) {
    return this.recompute(message.chatId);
  }
}

export const statisticsService = new StatisticsService();
