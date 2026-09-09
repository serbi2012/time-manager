import type { WorkRecord } from "../../../shared/types";
import type { CodeMap } from "../../../store/types";
import { type LunchTimeRange } from "../../../shared/lib/lunch";
import { getRecordDurationForDate } from "./duration_calculator";
import { buildMarkdownTable } from "./text_table";
import {
    RECORD_COPY_COLUMNS,
    COPY_ROW_GENERAL_TASK_NAME,
} from "../constants";

export interface RecordCopyRow {
    record_id: string;
    work_name: string;
    task_name: string;
    deal_code: string;
    deal_name: string;
    category_name: string;
    duration_text: string;
    note: string;
}

export interface BuildRecordCopyRowsOptions {
    deal_codes: CodeMap;
    lunch_time?: LunchTimeRange;
}

interface DealAndNote {
    deal_name: string;
    note: string;
}

/**
 * 시간관리 양식의 거래명과 비고를 결정
 *
 * 업무가 "작업"이면 거래명 자리에 작업명을 넣고, 원래 거래명은 비고로 옮긴다.
 * 원래 비고가 있으면 뒤에 함께 남긴다.
 */
export function resolveDealAndNote(
    work_name: string,
    task_name: string,
    deal_name: string,
    note: string
): DealAndNote {
    if (task_name !== COPY_ROW_GENERAL_TASK_NAME) {
        return { deal_name, note };
    }

    const moved_note = [deal_name, note].filter(Boolean).join(" ");

    return { deal_name: work_name, note: moved_note };
}

/**
 * 표시할 레코드를 시간관리 양식 행 목록으로 변환
 *
 * 거래코드는 거래명 기준 매핑에서 조회한다.
 */
export function buildRecordCopyRows(
    records: WorkRecord[],
    selected_date: string,
    options: BuildRecordCopyRowsOptions
): RecordCopyRow[] {
    const { deal_codes, lunch_time } = options;
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
        const task_name = record.task_name || "";
        const source_deal_name = record.deal_name || record.work_name;
        const { deal_name, note } = resolveDealAndNote(
            record.work_name,
            task_name,
            source_deal_name,
            record.note || ""
        );

        return {
            record_id: record.id,
            work_name: record.work_name,
            task_name,
            deal_code: deal_codes[deal_name.trim()] || "",
            deal_name,
            category_name: record.category_name || "",
            duration_text: String(duration),
            note,
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
