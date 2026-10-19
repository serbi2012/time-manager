/**
 * 레코드 관련 순수 함수 모음
 */

// 타입
export type {
    SessionUpdateResult,
    RecordColumnProps,
    RecordActionsProps,
    RecordFormProps,
    RecordTableHeaderProps,
    CompletedModalProps,
    TrashModalProps,
    AutoCompleteField,
} from "./types";

// 시간 계산
export {
    getRecordDurationMinutes,
    getRecordDurationForDate,
    getTimeRangeForDate,
} from "./duration_calculator";

// 카테고리 유틸
export {
    getCategoryColor,
    getCategoryBadgeStyle,
    filterCategories,
    CATEGORY_COLORS,
    DEFAULT_CATEGORY_COLOR,
} from "./category_utils";

// 레코드 필터링
export {
    filterRecordsByDateSession,
    filterIncompleteRecords,
    filterDisplayableRecords,
    sortRecords,
    filterSessionsByDate,
    filterRecordsBySearch,
} from "./record_filters";

// 레코드 통계
export {
    type TodayStats,
    type CategoryStats,
    type WorkStats,
    calculateTodayStats,
    calculateCategoryStats,
    calculateWorkStats,
} from "./record_stats";

// 텍스트 테이블
export {
    getDisplayWidth,
    padString,
    buildMarkdownTable,
} from "./text_table";

// 셀 복사 값
export {
    type ResolveCopyCellValueOptions,
    resolveCopyCellValue,
} from "./copy_cell_value";

// 시간관리 양식 행
export {
    type RecordCopyRow,
    type BuildRecordCopyRowsOptions,
    resolveDealAndNote,
    resolveRecordCode,
    buildRecordCopyRows,
    getCopyRowCells,
    formatCopyRowsToMarkdown,
} from "./record_copy_rows";
