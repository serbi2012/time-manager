/**
 * 작업 기록을 마크다운 테이블 문자열로 변환하는 순수 함수
 */

import type { WorkRecord } from "../../../types";
import { getRecordDurationForDate } from "./duration_calculator";
import { type LunchTimeRange } from "../../../shared/lib/lunch";
import {
    MARKDOWN_COPY,
    RECORD_UI_TEXT,
    CHAR_CODE_THRESHOLD,
    HANGUL_CHAR_WIDTH,
    ASCII_CHAR_WIDTH,
} from "../constants";

function getDisplayWidth(str: string): number {
    let width = 0;
    for (const char of str) {
        width +=
            char.charCodeAt(0) > CHAR_CODE_THRESHOLD
                ? HANGUL_CHAR_WIDTH
                : ASCII_CHAR_WIDTH;
    }
    return width;
}

function padString(str: string, width: number): string {
    const display_width = getDisplayWidth(str);
    const padding = width - display_width;
    return str + " ".repeat(Math.max(0, padding));
}

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

    const columns = MARKDOWN_COPY.COLUMNS;
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

    const col_widths = columns.map((col, i) => {
        const header_width = getDisplayWidth(col);
        const max_data_width = data.reduce(
            (max, row) => Math.max(max, getDisplayWidth(row[i])),
            0
        );
        return Math.max(header_width, max_data_width);
    });

    const header_row =
        MARKDOWN_COPY.CELL_PREFIX +
        columns
            .map((col, i) => padString(col, col_widths[i]))
            .join(MARKDOWN_COPY.CELL_SEPARATOR) +
        MARKDOWN_COPY.CELL_SUFFIX;

    const separator =
        MARKDOWN_COPY.ROW_SEPARATOR +
        col_widths
            .map((w) =>
                MARKDOWN_COPY.HEADER_SEPARATOR.repeat(
                    w + MARKDOWN_COPY.PADDING_WIDTH
                )
            )
            .join(MARKDOWN_COPY.ROW_SEPARATOR) +
        MARKDOWN_COPY.ROW_SEPARATOR;

    const data_rows = data.map(
        (row) =>
            MARKDOWN_COPY.CELL_PREFIX +
            row
                .map((cell, i) => padString(cell, col_widths[i]))
                .join(MARKDOWN_COPY.CELL_SEPARATOR) +
            MARKDOWN_COPY.CELL_SUFFIX
    );

    return [header_row, separator, ...data_rows].join(MARKDOWN_COPY.LINE_BREAK);
}
