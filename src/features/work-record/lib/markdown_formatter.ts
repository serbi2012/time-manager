/**
 * 작업 기록을 마크다운 테이블 문자열로 변환하는 순수 함수
 */

import type { WorkRecord } from "../../../types";
import { getRecordDurationForDate } from "./duration_calculator";
import { type LunchTimeRange } from "../../../shared/lib/lunch";
import { buildMarkdownTable } from "./text_table";
import { MARKDOWN_COPY, RECORD_UI_TEXT } from "../constants";

/**
 * 작업 기록 배열을 마크다운 테이블 형식의 문자열로 변환
 *
 * @param records - 표시할 작업 기록 (is_deleted 제외 전 상태)
 * @param selected_date - 해당 날짜의 시간을 계산하기 위한 기준일
 * @returns 마크다운 테이블 문자열, 유효한 레코드가 없으면 null
 */
export function formatRecordsToMarkdown(
    records: WorkRecord[],
    selected_date: string,
    lunch_time?: LunchTimeRange
): string | null {
    const filtered = records.filter((r) => !r.is_deleted);

    if (filtered.length === 0) {
        return null;
    }

    const sorted = [...filtered].sort((a, b) =>
        (a.work_name || "").localeCompare(b.work_name || "", "ko")
    );

    const data = sorted.map((r) => {
        const duration = getRecordDurationForDate(r, selected_date, lunch_time);
        return [
            r.work_name,
            r.deal_name || r.work_name,
            `${duration}${RECORD_UI_TEXT.MINUTE_UNIT}`,
            r.category_name || "",
            r.note || "",
        ];
    });

    return buildMarkdownTable(MARKDOWN_COPY.COLUMNS, data);
}
