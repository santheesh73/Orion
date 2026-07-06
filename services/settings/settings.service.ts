"use client";

import { db } from "@/lib/db/orion-db";
import { settingsService as databaseSettingsService, DEFAULT_SETTINGS } from "@/services/database/settings.service";
import type { AppSettings, DatabaseExport } from "@/types/orion";

export class SettingsCenterService {
  get() {
    return databaseSettingsService.getOrCreate();
  }

  update(changes: Partial<AppSettings>) {
    return databaseSettingsService.update(changes);
  }

  reset() {
    return databaseSettingsService.update(DEFAULT_SETTINGS);
  }

  async exportSettings() {
    const settings = await this.get();
    return JSON.stringify({ type: "orion-settings", version: 1, exportedAt: Date.now(), settings }, null, 2);
  }

  async importSettings(raw: string) {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("The selected file does not contain Orion settings.");
    }
    const candidate = parsed as { settings?: unknown };
    const payload = candidate.settings && typeof candidate.settings === "object" ? candidate.settings as Partial<AppSettings> : parsed as Partial<AppSettings>;
    if (!payload || typeof payload !== "object") {
      throw new Error("The selected file does not contain Orion settings.");
    }
    return databaseSettingsService.update(payload);
  }

  async exportEverything(): Promise<string> {
    const payload: DatabaseExport = {
      version: 1,
      exportedAt: Date.now(),
      conversations: await db.conversations.toArray(),
      messages: await db.messages.toArray(),
      settings: await db.settings.toArray(),
      models: await db.models.toArray(),
      favorites: await db.favorites.toArray(),
      folders: await db.folders.toArray(),
      promptTemplates: await db.promptTemplates.toArray(),
      recentSearches: await db.recentSearches.toArray(),
      statistics: await db.statistics.toArray(),
      backups: await db.backups.toArray()
    };
    return JSON.stringify(payload, null, 2);
  }
}

export const settingsCenterService = new SettingsCenterService();
