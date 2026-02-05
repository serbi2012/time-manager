import { useState, useCallback } from "react";
import { searchDocs, type SearchResult } from "@/docs";

/**
 * 가이드 검색 기능 훅
 */
export function useGuideSearch() {
    const [search_query, setSearchQuery] = useState<string>("");
    const [search_results, setSearchResults] = useState<SearchResult[]>([]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const results = searchDocs(query);
        setSearchResults(results);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
    }, []);

    return {
        search_query,
        search_results,
        handleSearch,
        clearSearch,
    };
}
