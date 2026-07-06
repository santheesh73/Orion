"use client";

import Dexie, { type Table } from "dexie";
import type {
  AppSettings,
  BackupMetadata,
  ChatMessage,
  ChatThread,
  ConversationStatistics,
  DocumentFolder,
  DocumentSearchHistory,
  FavoriteRecord,
  FolderRecord,
  OrionDocumentChunk,
  OrionDocument,
  PromptTemplate,
  RecentSearch,
  StoredModelMetadata
} from "@/types/orion";

class OrionDatabase extends Dexie {
  conversations!: Table<ChatThread, string>;
  messages!: Table<ChatMessage, string>;
  settings!: Table<AppSettings, string>;
  models!: Table<StoredModelMetadata, string>;
  favorites!: Table<FavoriteRecord, string>;
  folders!: Table<FolderRecord, string>;
  promptTemplates!: Table<PromptTemplate, string>;
  recentSearches!: Table<RecentSearch, string>;
  statistics!: Table<ConversationStatistics, string>;
  backups!: Table<BackupMetadata, string>;
  documents!: Table<OrionDocument, string>;
  documentChunks!: Table<OrionDocumentChunk, string>;
  documentFolders!: Table<DocumentFolder, string>;
  documentSearchHistory!: Table<DocumentSearchHistory, string>;

  constructor() {
    super("orion-local-ai");
    this.version(1).stores({
      chats: "id, title, updatedAt, pinned, favorite",
      messages: "id, chatId, role, createdAt",
      documents: "id, name, kind, updatedAt"
    });

    this.version(2)
      .stores({
        chats: null,
        conversations:
          "id, title, createdAt, updatedAt, pinned, favorite, folderId, modelUsed, deleted, [deleted+updatedAt], [pinned+updatedAt], [favorite+updatedAt]",
        messages:
          "id, chatId, role, createdAt, updatedAt, status, deleted, [chatId+createdAt], [chatId+status], [chatId+deleted]",
        settings: "id, preferredModel, updatedAt",
        models: "id, name, version, status, backendType, downloadDate, updatedAt",
        favorites: "id, targetId, targetType, createdAt, [targetType+createdAt]",
        folders: "id, name, createdAt, updatedAt, deleted",
        promptTemplates: "id, name, category, favorite, createdAt, updatedAt, [category+favorite]",
        recentSearches: "id, query, scope, timestamp, frequency, [scope+timestamp]",
        statistics: "id, conversationId, lastActiveAt",
        backups: "id, name, createdAt, version",
        documents: "id, name, kind, updatedAt"
      })
      .upgrade(async (transaction) => {
        const legacyChats = transaction.table("chats") as Table<ChatThread, string>;
        const conversations = transaction.table("conversations") as Table<ChatThread, string>;
        const chats = await legacyChats.toArray();
        if (chats.length > 0) {
          await conversations.bulkPut(
            chats.map((chat) => ({
              ...chat,
              folderId: chat.folderId ?? null,
              messageCount: chat.messageCount ?? 0,
              modelUsed: chat.modelUsed ?? null,
              lastMessagePreview: chat.lastMessagePreview ?? "",
              deleted: chat.deleted ?? false
            }))
          );
        }
      });

    this.version(3).stores({
      conversations:
        "id, title, createdAt, updatedAt, pinned, favorite, folderId, modelUsed, deleted, [deleted+updatedAt], [pinned+updatedAt], [favorite+updatedAt]",
      messages:
        "id, chatId, role, createdAt, updatedAt, status, deleted, [chatId+createdAt], [chatId+status], [chatId+deleted]",
      settings: "id, preferredModel, updatedAt",
      models: "id, name, version, status, backendType, downloadDate, updatedAt",
      favorites: "id, targetId, targetType, createdAt, [targetType+createdAt]",
      folders: "id, name, createdAt, updatedAt, deleted",
      promptTemplates: "id, name, category, favorite, createdAt, updatedAt, [category+favorite]",
      recentSearches: "id, query, scope, timestamp, frequency, [scope+timestamp]",
      statistics: "id, conversationId, lastActiveAt",
      backups: "id, name, createdAt, version",
      documents:
        "id, name, kind, mimeType, size, createdAt, updatedAt, modifiedAt, status, favorite, pinned, folderId, lastOpenedAt, [pinned+updatedAt], [favorite+updatedAt], [folderId+updatedAt]",
      documentChunks:
        "id, documentId, documentName, index, pageNumber, createdAt, [documentId+index], [documentId+pageNumber]",
      documentFolders: "id, name, createdAt, updatedAt",
      documentSearchHistory: "id, query, createdAt"
    });
  }
}

export const db = new OrionDatabase();
