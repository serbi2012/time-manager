/**
 * Work Record 관련 메시지 상수
 */

// ========================================
// Success Messages
// ========================================
export const RECORD_SUCCESS = {
    ADDED: "작업이 추가되었습니다",
    UPDATED: "작업이 수정되었습니다",
    DELETED: "작업이 삭제되었습니다",
    COMPLETED: "작업이 완료 처리되었습니다",
    RESTORED: "작업이 복원되었습니다",
    COPIED: "작업이 복사되었습니다",
    COPIED_TO_CLIPBOARD: "클립보드에 복사되었습니다",
    MOVED: "작업이 이동되었습니다",
    SESSION_ADDED: "세션이 추가되었습니다",
    SESSION_UPDATED: "세션이 수정되었습니다",
    SESSION_DELETED: "세션이 삭제되었습니다",
    DATE_CHANGED: "날짜가 변경되었습니다",
    TIMER_STARTED: "타이머가 시작되었습니다",
    TIMER_STOPPED: "타이머가 정지되었습니다",
} as const;

// ========================================
// Error Messages
// ========================================
export const RECORD_ERROR = {
    TIME_REQUIRED: "시작 시간과 종료 시간을 입력해주세요",
    INVALID_END_TIME: "종료 시간은 시작 시간보다 늦어야 합니다",
    INVALID_TIME_FORMAT: "올바른 시간 형식이 아닙니다 (HH:mm)",
    WORK_NAME_REQUIRED: "작업명을 입력해주세요",
    DURATION_REQUIRED: "소요 시간을 입력해주세요",
    SESSION_ADD_FAILED: "세션 추가에 실패했습니다",
    SESSION_UPDATE_FAILED: "세션 수정에 실패했습니다",
    SESSION_DELETE_FAILED: "세션 삭제에 실패했습니다",
    RECORD_NOT_FOUND: "작업을 찾을 수 없습니다",
    DATE_CHANGE_FAILED: "날짜 변경에 실패했습니다",
} as const;

// ========================================
// Warning Messages
// ========================================
export const RECORD_WARNING = {
    TIME_CONFLICT: "다른 작업과 시간이 겹칩니다",
    NO_SESSIONS: "세션이 없습니다",
    INCOMPLETE_SESSION: "완료되지 않은 세션이 있습니다",
    NO_RECORDS_TO_COPY: "복사할 작업이 없습니다",
} as const;

// ========================================
// Info Messages
// ========================================
export const RECORD_INFO = {
    OPTION_HIDDEN: (label: string) => `"${label}" 옵션이 숨겨졌습니다`,
    OPTION_ADDED: (label: string) => `"${label}" 옵션이 추가되었습니다`,
    FILTERING: (count: number) => `${count}개 작업 표시 중`,
    NO_CHANGES: "변경사항이 없습니다",
} as const;

// ========================================
// Confirm Messages
// ========================================
export const RECORD_CONFIRM = {
    DELETE: {
        TITLE: "삭제 확인",
        DESCRIPTION: "이 기록을 휴지통으로 이동하시겠습니까?",
        OK_TEXT: "삭제",
        CANCEL_TEXT: "취소",
    },
    COMPLETE: {
        TITLE: "작업 완료",
        DESCRIPTION: "이 작업을 완료 처리하시겠습니까?",
    },
    RESTORE: {
        TITLE: "작업 복원",
        DESCRIPTION: "이 작업을 복원하시겠습니까?",
    },
    DELETE_SESSION: {
        TITLE: "세션 삭제",
        DESCRIPTION: "정말 이 세션을 삭제하시겠습니까?",
    },
    PERMANENT_DELETE: {
        TITLE: "영구 삭제",
        DESCRIPTION: "이 작업을 영구적으로 삭제하시겠습니까? (복원 불가)",
    },
} as const;
