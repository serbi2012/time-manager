/**
 * 레코드 필터 상태 관리 훅
 */

import { useState, useCallback, useMemo } from "react";
import type { WorkRecord } from "../../../shared/types";
import { filterRecordsBySearch } from "../lib/record_filters";

export interface RecordFilters {
    /** 검색 키워드 */
    search: string;
    /** 선택된 카테고리 */
    selected_category: string | null;
    /** 완료된 작업 표시 여부 */
    show_completed: boolean;
}

export interface UseRecordFiltersReturn {
    /** 필터 상태 */
    filters: RecordFilters;
    /** 검색어 변경 */
    setSearch: (value: string) => void;
    /** 카테고리 선택 변경 */
    setSelectedCategory: (value: string | null) => void;
    /** 완료 작업 표시 토글 */
    toggleShowCompleted: () => void;
    /** 필터 초기화 */
    resetFilters: () => void;
    /** 레코드 필터링 */
    applyFilters: (records: WorkRecord[]) => WorkRecord[];
}

const DEFAULT_FILTERS: RecordFilters = {
    search: "",
    selected_category: null,
    show_completed: false,
};

/**
 * 레코드 필터 상태 관리 훅
 */
export function useRecordFilters(): UseRecordFiltersReturn {
    const [search, setSearchInternal] = useState(DEFAULT_FILTERS.search);
    const [selected_category, setSelectedCategoryInternal] = useState<
        string | null
    >(DEFAULT_FILTERS.selected_category);
    const [show_completed, setShowCompletedInternal] = useState(
        DEFAULT_FILTERS.show_completed
    );

    const filters = useMemo(
        () => ({
            search,
            selected_category,
            show_completed,
        }),
        [search, selected_category, show_completed]
    );

    const setSearch = useCallback((value: string) => {
        setSearchInternal(value);
    }, []);

    const setSelectedCategory = useCallback((value: string | null) => {
        setSelectedCategoryInternal(value);
    }, []);

    const toggleShowCompleted = useCallback(() => {
        setShowCompletedInternal((prev) => !prev);
    }, []);

    const resetFilters = useCallback(() => {
        setSearchInternal(DEFAULT_FILTERS.search);
        setSelectedCategoryInternal(DEFAULT_FILTERS.selected_category);
        setShowCompletedInternal(DEFAULT_FILTERS.show_completed);
    }, []);

    const applyFilters = useCallback(
        (records: WorkRecord[]): WorkRecord[] => {
            let filtered = records;

            // 검색 필터
            if (search.trim()) {
                filtered = filterRecordsBySearch(filtered, search);
            }

            // 카테고리 필터
            if (selected_category) {
                filtered = filtered.filter(
                    (r) => r.category_name === selected_category
                );
            }

            // 완료 작업 필터
            if (!show_completed) {
                filtered = filtered.filter((r) => !r.is_completed);
            }

            return filtered;
        },
        [search, selected_category, show_completed]
    );

    return {
        filters,
        setSearch,
        setSelectedCategory,
        toggleShowCompleted,
        resetFilters,
        applyFilters,
    };
}
