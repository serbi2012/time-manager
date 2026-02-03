/**
 * 작업 레코드 데이터 관리 훅
 */

import { useMemo } from "react";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    filterDisplayableRecords,
    sortRecords,
    filterRecordsBySearch,
} from "../lib/record_filters";
import type { WorkRecord } from "../../../shared/types";

export interface UseRecordDataReturn {
    /** 표시할 레코드 목록 */
    display_records: WorkRecord[];
    /** 전체 레코드 수 */
    total_count: number;
    /** 완료된 레코드 목록 */
    completed_records: WorkRecord[];
    /** 삭제된 레코드 목록 */
    deleted_records: WorkRecord[];
    /** 선택된 날짜 */
    selected_date: string;
}

/**
 * 작업 레코드 데이터 관리 훅
 */
export function useRecordData(search_text: string = ""): UseRecordDataReturn {
    const {
        records,
        selected_date,
        timer,
        getCompletedRecords,
        getDeletedRecords,
    } = useWorkStore();

    // 표시할 레코드 필터링 및 정렬
    const display_records = useMemo(() => {
        let filtered = filterDisplayableRecords(records, selected_date);

        // 검색어 필터링
        if (search_text) {
            filtered = filterRecordsBySearch(filtered, search_text);
        }

        // 정렬 (타이머 활성화 > 미완료 > 완료)
        return sortRecords(filtered, timer.active_record_id);
    }, [records, selected_date, search_text, timer.active_record_id]);

    // 완료된 레코드
    const completed_records = useMemo(
        () => getCompletedRecords(),
        [getCompletedRecords, records]
    );

    // 삭제된 레코드
    const deleted_records = useMemo(
        () => getDeletedRecords(),
        [getDeletedRecords, records]
    );

    return {
        display_records,
        total_count: display_records.length,
        completed_records,
        deleted_records,
        selected_date,
    };
}
