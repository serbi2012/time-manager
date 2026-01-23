/**
 * 레코드/세션 시간 계산 관련 함수
 */

import type { WorkRecord } from "../../../shared/types";
import { timeToMinutes } from "../../../shared/lib/time";
import { getSessionMinutes } from "../../../shared/lib/session";

/**
 * 레코드의 총 소요 시간(분) 가져오기
 * NaN 처리 및 세션 기반 재계산 지원
 */
export function getRecordDurationMinutes(record: WorkRecord): number {
    // 유효한 duration_minutes가 있으면 반환
    if (
        record.duration_minutes !== undefined &&
        !isNaN(record.duration_minutes) &&
        record.duration_minutes > 0
    ) {
        return record.duration_minutes;
    }
    
    // 세션에서 계산
    if (record.sessions && record.sessions.length > 0) {
        const total = record.sessions.reduce(
            (sum, s) => sum + getSessionMinutes(s),
            0
        );
        if (total > 0) {
            return Math.max(1, total);
        }
    }
    
    // 시작/종료 시간으로 계산
    if (record.start_time && record.end_time) {
        const start_mins = timeToMinutes(record.start_time);
        const end_mins = timeToMinutes(record.end_time);
        const diff = end_mins - start_mins;
        if (diff > 0) {
            return Math.max(1, diff);
        }
    }
    
    return 0;
}

/**
 * 특정 날짜의 세션들만 시간 합산
 */
export function getRecordDurationForDate(
    record: WorkRecord,
    target_date: string
): number {
    if (!record.sessions || record.sessions.length === 0) {
        // 세션이 없으면 레코드 날짜가 맞는 경우만 전체 시간 반환
        if (record.date === target_date) {
            return getRecordDurationMinutes(record);
        }
        return 0;
    }
    
    // 해당 날짜의 세션들만 필터링하여 시간 합산
    const date_sessions = record.sessions.filter(
        (s) => (s.date || record.date) === target_date
    );
    
    if (date_sessions.length === 0) {
        return 0;
    }
    
    return date_sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );
}

/**
 * 특정 날짜의 시작/종료 시간 가져오기
 */
export function getTimeRangeForDate(
    record: WorkRecord,
    target_date: string
): { start_time: string; end_time: string } {
    if (!record.sessions || record.sessions.length === 0) {
        // 세션이 없으면 레코드 날짜가 맞는 경우만 레코드 시간 반환
        if (record.date === target_date) {
            return {
                start_time: record.start_time || "",
                end_time: record.end_time || "",
            };
        }
        return { start_time: "", end_time: "" };
    }
    
    // 해당 날짜의 세션들만 필터링
    const date_sessions = record.sessions.filter(
        (s) => (s.date || record.date) === target_date
    );
    
    if (date_sessions.length === 0) {
        return { start_time: "", end_time: "" };
    }
    
    // 시간순 정렬
    const sorted = [...date_sessions].sort((a, b) => {
        const a_start = a.start_time || "00:00";
        const b_start = b.start_time || "00:00";
        return a_start.localeCompare(b_start);
    });
    
    return {
        start_time: sorted[0].start_time || "",
        end_time: sorted[sorted.length - 1].end_time || "",
    };
}

/**
 * 레코드의 세션들을 재계산하여 총 시간 업데이트
 */
export function recalculateRecordDuration(record: WorkRecord): WorkRecord {
    if (!record.sessions || record.sessions.length === 0) {
        return record;
    }
    
    const total = record.sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );
    
    // 세션 정렬
    const sorted_sessions = [...record.sessions].sort((a, b) => {
        const date_a = a.date || record.date;
        const date_b = b.date || record.date;
        if (date_a !== date_b) return date_a.localeCompare(date_b);
        return (a.start_time || "").localeCompare(b.start_time || "");
    });
    
    const first = sorted_sessions[0];
    const last = sorted_sessions[sorted_sessions.length - 1];
    
    return {
        ...record,
        sessions: sorted_sessions,
        duration_minutes: Math.max(1, total),
        start_time: first?.start_time || record.start_time,
        end_time: last?.end_time || record.end_time,
    };
}
