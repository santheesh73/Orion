"use client";

import { create } from "zustand";
import { DEFAULT_MODEL_ID } from "@/lib/constants/models";
import type {
  AppSettings,
  ChatMessage,
  ChatThread,
  DocumentChatMessage,
  DocumentSearchResult,
  DownloadState,
  GenerationSettings,
  GenerationState,
  ModelProgress,
  OrionDocument,
  RuntimeState
} from "@/types/orion";

const initialAppSettings: AppSettings = {
  id: "default",
  adminMode: false,
  theme: "system",
  language: "en",
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 768,
  preferredModel: DEFAULT_MODEL_ID,
  fontSize: "md",
  autoSave: true,
  startupBehavior: "last-session",
  defaultLandingPage: "home",
  dateFormat: "system",
  timeFormat: "system",
  appearance: {
    accentColor: "blue",
    chatDensity: "comfortable",
    compactMode: false,
    roundedCorners: "md",
    animationSpeed: "normal",
    glassEffects: true,
    transparency: 72,
    sidebarWidth: 280
  },
  ai: {
    contextLength: 4096,
    streaming: true,
    autoLoadLastModel: true,
    responseLength: "balanced",
    creativityPreset: "balanced",
    conversationMemory: true,
    promptTemplates: []
  },
  lastLoadedModel: null,
  documents: {
    defaultFolderId: null,
    chunkSize: 1800,
    previewTheme: "system",
    autoIndex: true,
    maxFileSizeMb: 80,
    documentCache: true,
    searchMode: "hybrid"
  },
  privacy: {
    localOnly: true,
    telemetry: false,
    analytics: false,
    crashReports: false
  },
  personalization: {
    displayName: "",
    occupation: "",
    responseStyle: "friendly",
    customInstructions: ""
  },
  shortcuts: {
    commandPalette: "Ctrl+K",
    newChat: "Ctrl+N",
    search: "Ctrl+F",
    settings: "Ctrl+,",
    exportData: "Ctrl+Shift+E",
    importData: "Ctrl+Shift+I",
    toggleSidebar: "Ctrl+B",
    toggleTheme: "Ctrl+Shift+L",
    generate: "Ctrl+Enter",
    stop: "Escape"
  },
  accessibility: {
    reduceMotion: false,
    announceStreaming: true,
    highContrast: false,
    keyboardNavigation: true,
    screenReaderMode: false,
    focusIndicators: true,
    fontScaling: 100,
    lineHeight: 1.6
  },
  keyboard: {
    sendShortcut: "mod-enter",
    escapeStopsGeneration: true
  },
  systemPrompt:
    "You are Orion, a helpful and friendly AI assistant created by Santheesh. Always answer the user's questions clearly and directly in a conversational tone.",
  updatedAt: Date.now()
};

interface OrionState {
  activeChatId: string | null;
  chats: ChatThread[];
  messages: ChatMessage[];
  documents: OrionDocument[];
  selectedDocumentIds: string[];
  documentSearchResults: DocumentSearchResult[];
  documentChatMessages: DocumentChatMessage[];
  documentProcessing: Record<string, { status: OrionDocument["status"]; progress: number; message: string }>;
  selectedModelId: string;
  modelProgress: ModelProgress;
  download: DownloadState;
  generation: GenerationState;
  runtime: RuntimeState;
  settings: GenerationSettings;
  appSettings: AppSettings;
  setActiveChatId: (chatId: string | null) => void;
  setChats: (chats: ChatThread[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  setDocuments: (documents: OrionDocument[]) => void;
  upsertDocument: (document: OrionDocument) => void;
  removeDocument: (documentId: string) => void;
  setSelectedDocumentIds: (documentIds: string[]) => void;
  setDocumentSearchResults: (results: DocumentSearchResult[]) => void;
  setDocumentChatMessages: (messages: DocumentChatMessage[]) => void;
  appendDocumentChatMessage: (message: DocumentChatMessage) => void;
  updateDocumentChatMessage: (id: string, content: string) => void;
  setDocumentProcessing: (documentId: string, processing: { status: OrionDocument["status"]; progress: number; message: string }) => void;
  clearDocumentProcessing: (documentId: string) => void;
  setSelectedModelId: (modelId: string) => void;
  setModelProgress: (progress: ModelProgress) => void;
  setDownload: (download: Partial<DownloadState>) => void;
  setGeneration: (generation: Partial<GenerationState>) => void;
  resetGeneration: () => void;
  setRuntime: (runtime: Partial<RuntimeState>) => void;
  updateSettings: (settings: Partial<GenerationSettings>) => void;
  setAppSettings: (settings: AppSettings) => void;
}

const initialDownload: DownloadState = {
  modelId: null,
  status: "idle",
  progress: 0,
  speedBytesPerSecond: 0,
  etaSeconds: null,
  sizeBytes: 0,
  downloadedBytes: 0,
  message: "Model not downloaded"
};

const initialGeneration: GenerationState = {
  status: "idle",
  activeMessageId: null,
  startedAt: null,
  firstTokenAt: null,
  completedAt: null,
  tokenCount: 0,
  tokensPerSecond: 0,
  latencyMs: null,
  error: null
};

const initialRuntime: RuntimeState = {
  backend: "unknown",
  webllmVersion: null,
  workerStatus: "idle",
  loadedModelId: null,
  modelLoadTimeMs: null,
  memoryUsageMb: null,
  storageUsageBytes: 0,
  storageQuotaBytes: 0,
  gpuVendor: null,
  maxStorageBufferBindingSize: null,
  error: null
};

export const useOrionStore = create<OrionState>((set) => ({
  activeChatId: null,
  chats: [],
  messages: [],
  documents: [],
  selectedDocumentIds: [],
  documentSearchResults: [],
  documentChatMessages: [],
  documentProcessing: {},
  selectedModelId: DEFAULT_MODEL_ID,
  modelProgress: { status: "idle", progress: 0, message: "Model not loaded" },
  download: initialDownload,
  generation: initialGeneration,
  runtime: initialRuntime,
  settings: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxTokens: 768,
    systemPrompt:
      "You are Orion, a concise, privacy-first AI assistant running fully on this device. You were created by Santheesh. You must provide precise and accurate answers without hallucinating irrelevant or extra details. Do not make up information about your creator or background. Be helpful, direct, and clear."
  },
  appSettings: initialAppSettings,
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setChats: (chats) => set({ chats }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === id ? { ...message, content } : message))
    })),
  setDocuments: (documents) => set({ documents }),
  upsertDocument: (document) =>
    set((state) => ({
      documents: [document, ...state.documents.filter((item) => item.id !== document.id)].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      })
    })),
  removeDocument: (documentId) =>
    set((state) => ({
      documents: state.documents.filter((document) => document.id !== documentId),
      selectedDocumentIds: state.selectedDocumentIds.filter((id) => id !== documentId),
      documentSearchResults: state.documentSearchResults.filter((result) => result.documentId !== documentId)
    })),
  setSelectedDocumentIds: (selectedDocumentIds) => set({ selectedDocumentIds }),
  setDocumentSearchResults: (documentSearchResults) => set({ documentSearchResults }),
  setDocumentChatMessages: (documentChatMessages) => set({ documentChatMessages }),
  appendDocumentChatMessage: (message) =>
    set((state) => ({ documentChatMessages: [...state.documentChatMessages, message] })),
  updateDocumentChatMessage: (id, content) =>
    set((state) => ({
      documentChatMessages: state.documentChatMessages.map((message) =>
        message.id === id ? { ...message, content } : message
      )
    })),
  setDocumentProcessing: (documentId, processing) =>
    set((state) => ({ documentProcessing: { ...state.documentProcessing, [documentId]: processing } })),
  clearDocumentProcessing: (documentId) =>
    set((state) => {
      const next = { ...state.documentProcessing };
      delete next[documentId];
      return { documentProcessing: next };
    }),
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setModelProgress: (modelProgress) => set({ modelProgress }),
  setDownload: (download) => set((state) => ({ download: { ...state.download, ...download } })),
  setGeneration: (generation) => set((state) => ({ generation: { ...state.generation, ...generation } })),
  resetGeneration: () => set({ generation: initialGeneration }),
  setRuntime: (runtime) => set((state) => ({ runtime: { ...state.runtime, ...runtime } })),
  updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setAppSettings: (appSettings) =>
    set({
      appSettings,
      selectedModelId: appSettings.preferredModel,
      settings: {
        temperature: appSettings.temperature,
        topP: appSettings.topP,
        topK: appSettings.topK,
        maxTokens: appSettings.maxTokens,
        systemPrompt: appSettings.systemPrompt
      }
    })
}));
