"use client";

import { ORION_MODELS } from "@/lib/constants/models";
import { getModelCacheStatus } from "@/services/ai/model-manager";
import { modelService as databaseModelService } from "@/services/database/model.service";

export class SettingsModelService {
  listAvailable() {
    return ORION_MODELS;
  }

  listInstalled() {
    return databaseModelService.list();
  }

  async withCacheStatus() {
    return Promise.all(
      ORION_MODELS.map(async (model) => ({
        ...model,
        cached: await getModelCacheStatus(model.id)
      }))
    );
  }
}

export const settingsModelService = new SettingsModelService();
