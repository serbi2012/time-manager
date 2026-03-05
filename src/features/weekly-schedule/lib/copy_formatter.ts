/**
 * 주간 일정 복사 형식 생성 함수
 */

import type { WorkRecord } from "../../../shared/types";
import { formatDuration } from "../../../shared/lib/time";
import { getRecordDurationForDate } from "../../work-record/lib/duration_calculator";
import { type LunchTimeRange } from "../../../shared/lib/lunch";
import { DAY_NAMES_SHORT } from "@/shared/constants";
import { COPY_FORMAT_LABELS } from "../constants";

export { COPY_FORMAT_LABELS } from "../constants";

/**
 * 복사 형식 타입
 */
export type CopyFormat = "format1" | "format2" | "format3";

/**
 * 날짜별 레코드 그룹화
 */
export interface DayRecords {
    date: string;
    day_of_week: string;
    records: WorkRecord[];
    total_minutes: number;
}

/**
 * 날짜 문자열에서 요일 가져오기
 */
export function getDayOfWeek(date_str: string): string {
    const date = new Date(date_str);
    return DAY_NAMES_SHORT[date.getDay()];
}

/**
 * 주간 날짜 범위 생성
 */
export function getWeekDates(base_date: string): string[] {
    const date = new Date(base_date);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // 월요일 기준
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
    }
    
    return dates;
}

/**
 * 레코드를 날짜별로 그룹화
 */
export function groupRecordsByDate(
    records: WorkRecord[],
    dates: string[],
    lunch_time?: LunchTimeRange
): DayRecords[] {
    return dates.map((date) => {
        const day_records = records.filter((r) => {
            if (r.is_deleted) return false;
            if (r.date === date) return true;
            if (r.sessions?.some((s) => s.date === date)) return true;
            return false;
        });
        
        const total_minutes = day_records.reduce(
            (sum, r) => sum + getRecordDurationForDate(r, date, lunch_time),
            0
        );
        
        return {
            date,
            day_of_week: getDayOfWeek(date),
            records: day_records,
            total_minutes,
        };
    });
}

/**
 * 형식 1로 복사 텍스트 생성 (기본)
 */
export function formatCopyText1(day_records: DayRecords[], lunch_time?: LunchTimeRange): string {
    const lines: string[] = [];
    
    day_records.forEach((day) => {
        if (day.records.length === 0) return;
        
        lines.push(`[${day.date} (${day.day_of_week})]`);
        day.records.forEach((r) => {
            const duration = getRecordDurationForDate(r, day.date, lunch_time);
            lines.push(`- ${r.work_name}: ${formatDuration(duration)}`);
        });
        lines.push(`${COPY_FORMAT_LABELS.totalPrefix}${formatDuration(day.total_minutes)}`);
        lines.push("");
    });
    
    return lines.join("\n");
}

/**
 * 형식 2로 복사 텍스트 생성 (상세)
 */
export function formatCopyText2(day_records: DayRecords[], lunch_time?: LunchTimeRange): string {
    const lines: string[] = [];
    
    day_records.forEach((day) => {
        if (day.records.length === 0) return;
        
        lines.push(`## ${day.date} (${day.day_of_week})`);
        day.records.forEach((r) => {
            const duration = getRecordDurationForDate(r, day.date, lunch_time);
            lines.push(`### ${r.work_name}`);
            if (r.deal_name) lines.push(`- ${COPY_FORMAT_LABELS.dealPrefix}${r.deal_name}`);
            lines.push(`- ${COPY_FORMAT_LABELS.categoryPrefix}${r.category_name}`);
            lines.push(`- ${COPY_FORMAT_LABELS.timePrefix}${formatDuration(duration)}`);
            if (r.note) lines.push(`- ${COPY_FORMAT_LABELS.notePrefix}${r.note}`);
            lines.push("");
        });
        lines.push(`**${COPY_FORMAT_LABELS.totalBoldPrefix}${formatDuration(day.total_minutes)}**`);
        lines.push("");
    });
    
    return lines.join("\n");
}

/**
 * 형식 3로 복사 텍스트 생성 (간단)
 */
export function formatCopyText3(day_records: DayRecords[], lunch_time?: LunchTimeRange): string {
    const lines: string[] = [];
    
    day_records.forEach((day) => {
        if (day.records.length === 0) return;
        
        const items = day.records.map((r) => {
            const duration = getRecordDurationForDate(r, day.date, lunch_time);
            return `${r.work_name}(${formatDuration(duration)})`;
        });
        
        lines.push(`${day.day_of_week}: ${items.join(", ")}`);
    });
    
    return lines.join("\n");
}

/**
 * 선택한 형식으로 복사 텍스트 생성
 */
export function formatCopyText(
    day_records: DayRecords[],
    format: CopyFormat,
    lunch_time?: LunchTimeRange
): string {
    switch (format) {
        case "format1":
            return formatCopyText1(day_records, lunch_time);
        case "format2":
            return formatCopyText2(day_records, lunch_time);
        case "format3":
            return formatCopyText3(day_records, lunch_time);
        default:
            return formatCopyText1(day_records, lunch_time);
    }
}
