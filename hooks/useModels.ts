"use client";

import { useMemo, useState } from "react";
import { ORION_MODELS } from "@/lib/constants/models";
import { useModel } from "@/hooks/useModel";

export function useModels() {
  const model = useModel();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [sort, setSort] = useState<"name" | "size" | "context">("name");

  const families = useMemo(() => ["all", ...Array.from(new Set(ORION_MODELS.map((item) => item.family)))], []);
  const models = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ORION_MODELS.filter((item) => {
      const matchesQuery = !normalized || `${item.name} ${item.id} ${item.description}`.toLowerCase().includes(normalized);
      const matchesFamily = family === "all" || item.family === family;
      return matchesQuery && matchesFamily;
    }).sort((a, b) => {
      if (sort === "size") return a.sizeBytes - b.sizeBytes;
      if (sort === "context") return b.contextWindow - a.contextWindow;
      return a.name.localeCompare(b.name);
    });
  }, [family, query, sort]);

  return { ...model, models, families, query, setQuery, family, setFamily, sort, setSort };
}
