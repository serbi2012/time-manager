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
    MobileRecordCardProps,
    AutoCompleteField,
} from "./types";

// 충돌 감지
export {
    type TimeSlot,
    type ConflictCheckResult,
    collectTimeSlots,
    addRunningTimerSlot,
    checkOverlap,
    checkAndAdjustTimeRange,
    formatConflictInfo,
} from "./conflict_detector";

// 레코드 병합
export {
    type DuplicateGroup,
    type MergeResult,
    findDuplicateGroups,
    findExistingRecord,
    mergeRecords,
    autoMergeRecords,
} from "./record_merger";

// 시간 계산
export {
    getRecordDurationMinutes,
    getRecordDurationForDate,
    getTimeRangeForDate,
    recalculateRecordDuration,
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
