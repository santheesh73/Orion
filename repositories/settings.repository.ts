"use client";

import { db } from "@/lib/db/orion-db";
import type { AppSettings } from "@/types/orion";

export const SETTINGS_ID = "default";

export class SettingsRepository {
  async get() {
    return db.settings.get(SETTINGS_ID);
  }

  async save(settings: AppSettings) {
    await db.settings.put({ ...settings, id: SETTINGS_ID, updatedAt: Date.now() });
    return db.settings.get(SETTINGS_ID);
  }

  async update(changes: Partial<AppSettings>) {
    const current = await this.get();
    if (!current) return undefined;
    await db.settings.update(SETTINGS_ID, { ...changes, updatedAt: Date.now() });
    return db.settings.get(SETTINGS_ID);
  }
}

export const settingsRepository = new SettingsRepository();
