/**
 * 주간 날짜/레코드 계산 순수 함수
 */

import type { WorkRecord } from "@/shared/types";

const DAYS_IN_WEEK = 7;

/**
 * base_date가 속한 주의 월요일 기준 7일 날짜 배열 반환 (YYYY-MM-DD)
 */
export function getWeekDates(base_date: string): string[] {
    const date = new Date(base_date + "T12:00:00");
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);

    const dates: string[] = [];
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
}

/**
 * base_date가 속한 주의 시작일(월), 종료일(일)
 */
export function getWeekRange(base_date: string): {
    start: string;
    end: string;
} {
    const dates = getWeekDates(base_date);
    return {
        start: dates[0],
        end: dates[DAYS_IN_WEEK - 1],
    };
}

/**
 * 해당 날짜에 세션이 있거나 record.date가 해당 날짜인 레코드만 필터 (삭제 제외)
 */
export function getDayRecords(
    records: WorkRecord[],
    date: string
): WorkRecord[] {
    return records.filter((r) => {
        if (r.is_deleted) return false;
        if (r.date === date) return true;
        return r.sessions?.some((s) => (s.date || r.date) === date) ?? false;
    });
}

/**
 * 해당 주(월~일)에 포함되는 레코드만 필터 (삭제 제외)
 */
export function filterRecordsInWeek(
    records: WorkRecord[],
    week_start: string,
    week_end: string
): WorkRecord[] {
    return records.filter((r) => {
        if (r.is_deleted) return false;
        const in_range =
            r.sessions?.some((s) => {
                const session_date = s.date || r.date;
                return session_date >= week_start && session_date <= week_end;
            }) ?? false;
        return in_range || (r.date >= week_start && r.date <= week_end);
    });
}
