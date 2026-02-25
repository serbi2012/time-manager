/**
 * 레코드 세션 정렬 및 시간 재계산 공통 헬퍼
 *
 * addRecord, updateSession, deleteSession에서 공통으로 사용되는
 * 세션 정렬 + 총 시간 재계산 + 시작/종료 시간 갱신 로직
 */

import type { WorkRecord } from "../types";
import { getSessionMinutes } from "@/shared/lib/session";
import { timeToMinutes } from "@/shared/lib/time";

/**
 * 세션을 날짜+시작시간 순으로 정렬하고 레코드의 총 시간/시작/종료를 재계산
 *
 * mutative의 draft 객체에서 직접 호출됩니다.
 */
export function recalculateRecordFromSessions(
    record: WorkRecord,
    base_date?: string
): void {
    const date_fallback = base_date || record.date;

    record.sessions.sort((a, b) => {
        const date_a = a.date || date_fallback;
        const date_b = b.date || date_fallback;
        if (date_a !== date_b) return date_a.localeCompare(date_b);
        return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
    });

    const total_minutes = record.sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );
    record.duration_minutes = Math.max(1, total_minutes);
    record.start_time = record.sessions[0]?.start_time || record.start_time;
    record.end_time =
        record.sessions[record.sessions.length - 1]?.end_time ||
        record.end_time;
}
