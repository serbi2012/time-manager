import type { WorkRecord } from "../../../shared/types";
import type { DealCodeMap } from "../../../store/types";
import { type LunchTimeRange } from "../../../shared/lib/lunch";
import { getRecordDurationForDate } from "./duration_calculator";
import { buildMarkdownTable } from "./text_table";
import { RECORD_COPY_COLUMNS, RECORD_UI_TEXT } from "../constants";

export interface RecordCopyRow {
    record_id: string;
    work_name: string;
    deal_code: string;
    deal_name: string;
    duration_text: string;
    category_name: string;
    note: string;
}

/**
 * 표시할 레코드를 복사용 행 목록으로 변환
 *
 * 거래 코드는 거래명 기준 매핑에서 조회한다.
 */
export function buildRecordCopyRows(
    records: WorkRecord[],
    selected_date: string,
    deal_codes: DealCodeMap,
    lunch_time?: LunchTimeRange
): RecordCopyRow[] {
    const filtered = records.filter((r) => !r.is_deleted);

    const sorted = [...filtered].sort((a, b) =>
        (a.work_name || "").localeCompare(b.work_name || "", "ko")
    );

    return sorted.map((record) => {
        const duration = getRecordDurationForDate(
            record,
            selected_date,
            lunch_time
        );
        const deal_name = record.deal_name || record.work_name;

        return {
            record_id: record.id,
            work_name: record.work_name,
            deal_code: deal_codes[deal_name.trim()] || "",
            deal_name,
            duration_text: `${duration}${RECORD_UI_TEXT.MINUTE_UNIT}`,
            category_name: record.category_name || "",
            note: record.note || "",
        };
    });
}

/**
 * 복사용 행의 셀 값을 컬럼 순서대로 반환
 */
export function getCopyRowCells(row: RecordCopyRow): string[] {
    return [
        row.work_name,
        row.deal_code,
        row.deal_name,
        row.duration_text,
        row.category_name,
        row.note,
    ];
}

/**
 * 복사용 행 목록을 마크다운 테이블 문자열로 변환
 */
export function formatCopyRowsToMarkdown(rows: RecordCopyRow[]): string | null {
    if (rows.length === 0) return null;

    return buildMarkdownTable(RECORD_COPY_COLUMNS, rows.map(getCopyRowCells));
}
