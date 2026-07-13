"use client";

import { DEFAULT_MODEL_ID } from "@/lib/constants/models";
import { settingsRepository, SETTINGS_ID } from "@/repositories/settings.repository";
import type { AppSettings, GenerationSettings } from "@/types/orion";

export const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
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
    promptTemplates: [
      {
        id: "template_summarize",
        name: "Summarize",
        prompt: "Summarize this clearly with key takeaways.",
        category: "General",
        favorite: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: "template_explain",
        name: "Explain",
        prompt: "Explain this in plain language, then include technical details.",
        category: "Learning",
        favorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]
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
    "You are Orion, a concise, privacy-first AI assistant running fully on this device. You were created by Santheesh. Be helpful, accurate, and clear.",
  updatedAt: Date.now()
};

export class SettingsService {
  normalize(settings: Partial<AppSettings> | undefined): AppSettings {
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      appearance: { ...DEFAULT_SETTINGS.appearance, ...settings?.appearance },
      ai: { ...DEFAULT_SETTINGS.ai, ...settings?.ai },
      documents: { ...DEFAULT_SETTINGS.documents, ...settings?.documents },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...settings?.privacy },
      personalization: { ...DEFAULT_SETTINGS.personalization, ...settings?.personalization },
      shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...settings?.shortcuts },
      accessibility: { ...DEFAULT_SETTINGS.accessibility, ...settings?.accessibility },
      keyboard: { ...DEFAULT_SETTINGS.keyboard, ...settings?.keyboard },
      id: SETTINGS_ID,
      updatedAt: settings?.updatedAt ?? Date.now()
    };
  }

  async getOrCreate() {
    const existing = await settingsRepository.get();
    if (existing) {
      const normalized = this.normalize(existing);
      if (JSON.stringify(existing) !== JSON.stringify(normalized)) {
        await settingsRepository.save(normalized);
      }
      return normalized;
    }
    await settingsRepository.save(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  async update(changes: Partial<AppSettings>) {
    const current = await this.getOrCreate();
    const next: AppSettings = {
      ...current,
      ...changes,
      appearance: { ...current.appearance, ...changes.appearance },
      ai: { ...current.ai, ...changes.ai },
      documents: { ...current.documents, ...changes.documents },
      privacy: { ...current.privacy, ...changes.privacy },
      personalization: { ...current.personalization, ...changes.personalization },
      shortcuts: { ...current.shortcuts, ...changes.shortcuts },
      accessibility: { ...current.accessibility, ...changes.accessibility },
      keyboard: { ...current.keyboard, ...changes.keyboard },
      updatedAt: Date.now()
    };
    await settingsRepository.save(next);
    return next;
  }

  toGenerationSettings(settings: AppSettings): GenerationSettings {
    return {
      temperature: settings.temperature,
      topP: settings.topP,
      topK: settings.topK,
      maxTokens: settings.maxTokens,
      systemPrompt: settings.systemPrompt
    };
  }
}

export const settingsService = new SettingsService();
