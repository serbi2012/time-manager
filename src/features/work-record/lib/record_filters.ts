/**
 * 레코드 필터링 관련 순수 함수
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";
import { getCategoryColor } from "./category_utils";

// Re-export for backward compatibility
export { getCategoryColor };

/**
 * 선택된 날짜에 세션이 있는 레코드 필터링
 */
export function filterRecordsByDateSession(
    records: WorkRecord[],
    selected_date: string
): WorkRecord[] {
    return records.filter((record) => {
        if (record.is_deleted) return false;

        // 세션이 있는 경우 해당 날짜 세션이 있는지 확인
        if (record.sessions && record.sessions.length > 0) {
            return record.sessions.some(
                (s) => (s.date || record.date) === selected_date
            );
        }

        // 세션이 없는 경우 레코드 날짜 확인
        return record.date === selected_date;
    });
}

/**
 * 선택된 날짜에 미완료 레코드 필터링
 */
export function filterIncompleteRecords(
    records: WorkRecord[],
    selected_date: string
): WorkRecord[] {
    return records.filter((record) => {
        if (record.is_deleted || record.is_completed) return false;

        // 선택된 날짜 이전 + 당일 미완료 작업만 표시
        return record.date <= selected_date;
    });
}

/**
 * 오늘 표시할 레코드 필터링 (통합)
 * - 선택된 날짜에 세션이 있는 완료 레코드
 * - 선택된 날짜까지의 미완료 레코드
 */
export function filterDisplayableRecords(
    records: WorkRecord[],
    selected_date: string
): WorkRecord[] {
    return records.filter((record) => {
        if (record.is_deleted) return false;

        // 완료된 작업
        if (record.is_completed) {
            // 해당 날짜에 세션이 있으면 표시
            if (record.sessions && record.sessions.length > 0) {
                return record.sessions.some(
                    (s) => (s.date || record.date) === selected_date
                );
            }
            // 레코드 날짜가 같으면 표시
            return record.date === selected_date;
        }

        // 미완료 작업: 작업 날짜가 선택된 날짜 이전이면 표시
        return record.date <= selected_date;
    });
}

/**
 * 레코드 정렬 (타이머 활성화 > 미완료 > 완료, 날짜 역순)
 */
export function sortRecords(
    records: WorkRecord[],
    active_record_id: string | null
): WorkRecord[] {
    return [...records].sort((a, b) => {
        // 타이머가 실행 중인 레코드 우선
        if (a.id === active_record_id) return -1;
        if (b.id === active_record_id) return 1;

        // 미완료 우선
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
        }

        // 날짜 역순
        return b.date.localeCompare(a.date);
    });
}

/**
 * 특정 날짜의 세션 필터링
 */
export function filterSessionsByDate(
    sessions: WorkSession[],
    target_date: string,
    record_date: string
): WorkSession[] {
    return sessions.filter((s) => (s.date || record_date) === target_date);
}

/**
 * 검색어로 레코드 필터링
 */
export function filterRecordsBySearch(
    records: WorkRecord[],
    search_text: string
): WorkRecord[] {
    if (!search_text.trim()) return records;

    const lower_search = search_text.toLowerCase();

    return records.filter((record) => {
        const searchable = [
            record.work_name,
            record.deal_name,
            record.task_name,
            record.category_name,
            record.note,
            record.project_code,
        ]
            .join(" ")
            .toLowerCase();

        return searchable.includes(lower_search);
    });
}
