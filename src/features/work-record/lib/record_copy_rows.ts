import type { WorkRecord } from "../../../shared/types";
import type { CodeMap } from "../../../store/types";
import { type LunchTimeRange } from "../../../shared/lib/lunch";
import { getRecordDurationForDate } from "./duration_calculator";
import { buildMarkdownTable } from "./text_table";
import { RECORD_COPY_COLUMNS } from "../constants";

export interface RecordCopyRow {
    record_id: string;
    work_name: string;
    task_name: string;
    deal_code: string;
    deal_name: string;
    category_code: string;
    category_display: string;
    category_name: string;
    duration_text: string;
    note: string;
}

export interface BuildRecordCopyRowsOptions {
    deal_codes: CodeMap;
    category_codes: CodeMap;
    lunch_time?: LunchTimeRange;
}

/**
 * 코드와 이름을 "코드 이름" 형태로 결합, 코드가 없으면 빈 문자열
 */
export function formatCodeWithName(code: string, name: string): string {
    if (!code) return "";
    return `${code} ${name}`.trim();
}

/**
 * 표시할 레코드를 시간관리 양식 행 목록으로 변환
 *
 * 거래코드는 거래명, 카테고리 코드는 카테고리명 기준 매핑에서 조회한다.
 */
export function buildRecordCopyRows(
    records: WorkRecord[],
    selected_date: string,
    options: BuildRecordCopyRowsOptions
): RecordCopyRow[] {
    const { deal_codes, category_codes, lunch_time } = options;
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
        const category_name = record.category_name || "";
        const category_code = category_name
            ? category_codes[category_name.trim()] || ""
            : "";

        return {
            record_id: record.id,
            work_name: record.work_name,
            task_name: record.task_name || "",
            deal_code: deal_codes[deal_name.trim()] || "",
            deal_name,
            category_code,
            category_display: formatCodeWithName(category_code, category_name),
            category_name,
            duration_text: String(duration),
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
        row.task_name,
        row.deal_code,
        row.deal_name,
        row.category_display,
        row.category_name,
        row.duration_text,
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
