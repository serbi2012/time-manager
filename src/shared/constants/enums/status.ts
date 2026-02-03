/**
 * 상태 관련 enum
 */

// ============================================
// 건의사항 상태
// ============================================

/** 건의사항 상태 값 */
export const SuggestionStatus = {
    Pending: "pending",
    Reviewing: "reviewing",
    InProgress: "in_progress",
    Completed: "completed",
    Rejected: "rejected",
} as const;

/** 건의사항 상태 타입 */
export type SuggestionStatus =
    (typeof SuggestionStatus)[keyof typeof SuggestionStatus];

/** 건의사항 상태 라벨 */
export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
    [SuggestionStatus.Pending]: "대기중",
    [SuggestionStatus.Reviewing]: "검토중",
    [SuggestionStatus.InProgress]: "진행중",
    [SuggestionStatus.Completed]: "완료",
    [SuggestionStatus.Rejected]: "반려",
};

// ============================================
// 동기화 상태
// ============================================

/** 동기화 상태 값 */
export const SyncStatus = {
    Idle: "idle",
    Syncing: "syncing",
    Synced: "synced",
    Error: "error",
} as const;

/** 동기화 상태 타입 */
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];

// ============================================
// 필터 상태
// ============================================

/** 필터 상태 값 */
export const FilterStatus = {
    All: "all",
    Completed: "completed",
    Incomplete: "incomplete",
} as const;

/** 필터 상태 타입 */
export type FilterStatus = (typeof FilterStatus)[keyof typeof FilterStatus];

/** 삭제 필터 값 */
export const DeletedFilter = {
    Exclude: "exclude",
    Include: "include",
    Only: "only",
} as const;

/** 삭제 필터 타입 */
export type DeletedFilter = (typeof DeletedFilter)[keyof typeof DeletedFilter];

// ============================================
// 이슈 심각도
// ============================================

/** 이슈 심각도 값 */
export const IssueSeverity = {
    Error: "error",
    Warning: "warning",
    Info: "info",
} as const;

/** 이슈 심각도 타입 */
export type IssueSeverity = (typeof IssueSeverity)[keyof typeof IssueSeverity];
