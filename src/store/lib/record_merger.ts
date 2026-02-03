/**
 * 레코드 병합 관련 순수 함수들
 *
 * 같은 work_name + deal_name의 레코드를 찾고 병합하는 로직
 */

import type { WorkRecord, WorkSession } from "@/shared/types";
import { getSessionMinutes } from "@/shared/lib/session";

/**
 * 같은 작업 기록 찾기 (미완료 작업 우선)
 *
 * @param records 레코드 배열
 * @param date 기준 날짜 (YYYY-MM-DD)
 * @param work_name 작업명
 * @param deal_name 거래명
 * @returns 기존 레코드 또는 undefined
 */
export function findExistingRecord(
    records: WorkRecord[],
    date: string,
    work_name: string,
    deal_name: string
): WorkRecord | undefined {
    // 1. 미완료 작업 중에서 같은 work_name + deal_name 찾기 (날짜 무관)
    const incomplete_match = records.find(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );

    if (incomplete_match) {
        return incomplete_match;
    }

    // 2. 없으면 같은 날짜의 작업 찾기
    const date_match = records.find(
        (r) =>
            !r.is_deleted &&
            r.date === date &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );

    return date_match;
}

/**
 * 중복 미완료 레코드 찾기
 *
 * @param records 레코드 배열
 * @param work_name 작업명
 * @param deal_name 거래명
 * @returns 중복 레코드 배열 (2개 이상일 때만 의미 있음)
 */
export function findDuplicateIncompleteRecords(
    records: WorkRecord[],
    work_name: string,
    deal_name: string
): WorkRecord[] {
    return records.filter(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );
}

/**
 * 여러 레코드를 하나로 병합
 *
 * @param records_to_merge 병합할 레코드 배열 (2개 이상)
 * @returns { base_record: 병합된 레코드, deleted_ids: 삭제할 레코드 ID 배열 }
 */
export function mergeRecords(records_to_merge: WorkRecord[]): {
    base_record: WorkRecord;
    deleted_ids: string[];
} {
    if (records_to_merge.length === 0) {
        throw new Error("병합할 레코드가 없습니다.");
    }

    if (records_to_merge.length === 1) {
        return {
            base_record: records_to_merge[0],
            deleted_ids: [],
        };
    }

    // 날짜, 시작 시간 순으로 정렬
    const sorted = [...records_to_merge].sort((a, b) => {
        const date_cmp = a.date.localeCompare(b.date);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    const base = sorted[0];
    const others = sorted.slice(1);

    // 모든 세션 수집 (중복 ID 제거)
    const all_sessions: WorkSession[] = [...(base.sessions || [])];
    const session_ids = new Set(all_sessions.map((s) => s.id));

    others.forEach((r) => {
        (r.sessions || []).forEach((s) => {
            if (!session_ids.has(s.id)) {
                all_sessions.push(s);
                session_ids.add(s.id);
            }
        });
    });

    // 세션 정렬 (날짜, 시작 시간 순)
    all_sessions.sort((a, b) => {
        const date_a = a.date || base.date;
        const date_b = b.date || base.date;
        const date_cmp = date_a.localeCompare(date_b);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    // 총 시간 계산
    const total = all_sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );

    const first = all_sessions[0];
    const last = all_sessions[all_sessions.length - 1];

    return {
        base_record: {
            ...base,
            sessions: all_sessions,
            duration_minutes: Math.max(1, total),
            start_time: first?.start_time || base.start_time,
            end_time: last?.end_time || base.end_time,
            date: first?.date || base.date,
        },
        deleted_ids: others.map((r) => r.id),
    };
}

/**
 * 레코드에서 특정 세션을 제거하고 시간 재계산
 *
 * @param record 레코드
 * @param session_id 제거할 세션 ID
 * @returns 세션이 제거된 새 레코드 또는 null (세션이 모두 제거된 경우)
 */
export function removeSessionFromRecord(
    record: WorkRecord,
    session_id: string
): WorkRecord | null {
    const remaining_sessions = record.sessions.filter(
        (s) => s.id !== session_id
    );

    if (remaining_sessions.length === 0) {
        return null;
    }

    // 시간 재계산
    const total_minutes = remaining_sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );

    // 시간순 정렬
    const sorted_sessions = [...remaining_sessions].sort((a, b) => {
        const date_a = a.date || record.date;
        const date_b = b.date || record.date;
        if (date_a !== date_b) return date_a.localeCompare(date_b);
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    return {
        ...record,
        sessions: remaining_sessions,
        duration_minutes: Math.max(1, total_minutes),
        start_time: sorted_sessions[0]?.start_time || record.start_time,
        end_time:
            sorted_sessions[sorted_sessions.length - 1]?.end_time ||
            record.end_time,
    };
}
