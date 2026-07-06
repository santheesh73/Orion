"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { recentDocumentSearches, searchDocuments } from "@/services/document/search.service";
import { useOrionStore } from "@/store/orion-store";
import type { DocumentSearchHistory } from "@/types/orion";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<DocumentSearchHistory[]>([]);
  const { documentSearchResults, selectedDocumentIds, setDocumentSearchResults } = useOrionStore();

  useEffect(() => {
    void recentDocumentSearches().then(setHistory);
  }, []);

  async function runSearch(nextQuery = query, scopeIds = selectedDocumentIds) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setDocumentSearchResults([]);
      return [];
    }
    setIsSearching(true);
    try {
      const results = await searchDocuments(trimmed, scopeIds);
      setDocumentSearchResults(results);
      setHistory(await recentDocumentSearches());
      return results;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.");
      return [];
    } finally {
      setIsSearching(false);
    }
  }

  return {
    query,
    setQuery,
    results: documentSearchResults,
    history,
    isSearching,
    runSearch
  };
}
