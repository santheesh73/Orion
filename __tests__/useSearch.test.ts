import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../hooks/useSearch';
import * as searchService from '../services/document/search.service';

vi.mock('../services/document/search.service', () => ({
  recentDocumentSearches: vi.fn().mockResolvedValue([]),
  searchDocuments: vi.fn()
}));

vi.mock('../store/orion-store', () => ({
  useOrionStore: vi.fn(() => ({
    documentSearchResults: [],
    selectedDocumentIds: [],
    setDocumentSearchResults: vi.fn()
  }))
}));

describe('useSearch', () => {
  it('should initialize with default state', async () => {
    let result: any;
    await act(async () => {
      const { result: res } = renderHook(() => useSearch());
      result = res;
    });
    expect(result.current.query).toBe('');
    expect(result.current.isSearching).toBe(false);
    expect(result.current.history).toEqual([]);
    expect(result.current.results).toEqual([]);
  });

  it('should abort search if query is empty', async () => {
    const { result } = renderHook(() => useSearch());
    let searchResults;
    await act(async () => {
      searchResults = await result.current.runSearch('   ');
    });
    expect(searchResults).toEqual([]);
    expect(searchService.searchDocuments).not.toHaveBeenCalled();
  });

  it('should perform search and return results', async () => {
    const mockResults = [{ id: '1', score: 0.9 }];
    vi.mocked(searchService.searchDocuments).mockResolvedValue(mockResults as any);
    
    const { result } = renderHook(() => useSearch());
    let searchResults;
    
    await act(async () => {
      searchResults = await result.current.runSearch('test query');
    });
    
    expect(searchService.searchDocuments).toHaveBeenCalledWith('test query', []);
    expect(searchResults).toEqual(mockResults);
  });
});
