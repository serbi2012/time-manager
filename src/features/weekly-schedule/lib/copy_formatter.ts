/**
 * 주간 일정 복사 형식 생성 함수
 */

import type { WorkRecord } from "../../../shared/types";

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
