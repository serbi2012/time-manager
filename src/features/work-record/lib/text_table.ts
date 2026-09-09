import {
    MARKDOWN_COPY,
    CHAR_CODE_THRESHOLD,
    HANGUL_CHAR_WIDTH,
    ASCII_CHAR_WIDTH,
} from "../constants";

export function getDisplayWidth(str: string): number {
    let width = 0;
    for (const char of str) {
        width +=
            char.charCodeAt(0) > CHAR_CODE_THRESHOLD
                ? HANGUL_CHAR_WIDTH
                : ASCII_CHAR_WIDTH;
    }
    return width;
}

export function padString(str: string, width: number): string {
    const display_width = getDisplayWidth(str);
    const padding = width - display_width;
    return str + " ".repeat(Math.max(0, padding));
}

/**
 * 헤더와 데이터 행을 마크다운 테이블 문자열로 변환
 */
export function buildMarkdownTable(
    columns: readonly string[],
    rows: string[][]
): string {
    const col_widths = columns.map((col, i) => {
        const header_width = getDisplayWidth(col);
        const max_data_width = rows.reduce(
            (max, row) => Math.max(max, getDisplayWidth(row[i] ?? "")),
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

    const data_rows = rows.map(
        (row) =>
            MARKDOWN_COPY.CELL_PREFIX +
            row
                .map((cell, i) => padString(cell ?? "", col_widths[i]))
                .join(MARKDOWN_COPY.CELL_SEPARATOR) +
            MARKDOWN_COPY.CELL_SUFFIX
    );

    return [header_row, separator, ...data_rows].join(MARKDOWN_COPY.LINE_BREAK);
}
