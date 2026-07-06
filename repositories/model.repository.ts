"use client";

import { db } from "@/lib/db/orion-db";
import type { StoredModelMetadata } from "@/types/orion";

export class ModelRepository {
  async upsert(model: StoredModelMetadata) {
    await db.models.put({ ...model, updatedAt: Date.now() });
    return model;
  }

  async getById(id: string) {
    return db.models.get(id);
  }

  async list() {
    return db.models.orderBy("updatedAt").reverse().toArray();
  }

  async update(id: string, changes: Partial<StoredModelMetadata>) {
    await db.models.update(id, { ...changes, updatedAt: Date.now() });
    return db.models.get(id);
  }

  async remove(id: string) {
    await db.models.update(id, { status: "deleted", updatedAt: Date.now() });
  }
}

export const modelRepository = new ModelRepository();
