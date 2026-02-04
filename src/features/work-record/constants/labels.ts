/**
 * Work Record 관련 UI 레이블 상수
 */

// ========================================
// 테이블 컬럼 제목
// ========================================
export const RECORD_TABLE_COLUMN = {
    INDEX: "#",
    DATE: "날짜",
    START_TIME: "시작 시간",
    END_TIME: "종료 시간",
    DURATION: "소요 시간",
    DEAL_NAME: "거래명",
    WORK_NAME: "작업명",
    TASK_NAME: "업무명",
    CATEGORY: "카테고리",
    TIME: "시간",
    TIME_RANGE: "시작-종료",
    ACTIONS: "작업",
    COMPLETED_DATE: "완료일",
    DELETED_DATE: "삭제일",
} as const;

// ========================================
// 버튼 텍스트
// ========================================
export const RECORD_BUTTON = {
    ADD: "추가",
    EDIT: "편집",
    DELETE: "삭제",
    COMPLETE: "완료",
    RESTORE: "복원",
    COPY: "복사",
    MOVE: "이동",
    SAVE: "저장",
    CANCEL: "취소",
    CONFIRM: "확인",
    START_TIMER: "시작",
    STOP_TIMER: "정지",
    VIEW_COMPLETED: "완료",
    VIEW_TRASH: "휴지통",
    COPY_RECORDS: "내역 복사",
    NEW_WORK: "새 작업",
    FILTER: "필터",
    SEARCH: "검색",
} as const;

// ========================================
// 모달 제목
// ========================================
export const RECORD_MODAL_TITLE = {
    ADD: "작업 추가",
    EDIT: "작업 수정",
    COMPLETED: "완료된 작업 기록",
    TRASH: "휴지통",
    SESSION_EDIT: "세션 편집",
} as const;

// ========================================
// Placeholder
// ========================================
export const RECORD_PLACEHOLDER = {
    PROJECT_CODE: "프로젝트 코드 입력...",
    WORK_NAME: "작업명 입력...",
    TASK_NAME: "업무 선택",
    CATEGORY: "카테고리 선택",
    DEAL_NAME: "거래명 입력...",
    NOTE: "비고 입력...",
    SEARCH: "작업명 또는 거래명으로 검색...",
    TIME: "00:00",
    EMPTY_PROJECT_CODE: "(없음)",
} as const;

// ========================================
// 툴팁
// ========================================
export const RECORD_TOOLTIP = {
    EDIT: "수정",
    DELETE: "삭제",
    COMPLETE: "완료",
    UNCOMPLETE: "완료 취소",
    RESTORE: "복원",
    COPY: "복사",
    START_TIMER: "시작",
    STOP_TIMER: "정지",
    SWITCH_TIMER: "전환",
    VIEW_SESSIONS: "세션 보기",
    ADD_SESSION: "세션 추가",
    PREVIOUS_DATE: (key: string) => `이전 날짜 (${key})`,
    NEXT_DATE: (key: string) => `다음 날짜 (${key})`,
    TODAY: "오늘",
    COMPLETED_LIST: "완료된 작업 목록",
    TRASH_LIST: "삭제된 작업 (복구 가능)",
    COPY_RECORDS: "시간 관리 양식으로 복사",
} as const;

// ========================================
// 빈 상태 메시지
// ========================================
export const RECORD_EMPTY = {
    NO_RECORDS: "작업 기록이 없습니다",
    NO_COMPLETED: "완료된 작업이 없습니다",
    NO_TRASH: "휴지통이 비어있습니다",
    NO_SEARCH_RESULT: "검색 결과가 없습니다",
    ADD_HINT: "새 작업을 추가해보세요",
} as const;

// ========================================
// 통계 레이블
// ========================================
export const RECORD_STATS = {
    TOTAL_DURATION: "총 시간",
    COMPLETED_COUNT: "완료",
    INCOMPLETE_COUNT: "진행 중",
    COUNT_UNIT: "건",
    TODAY: "오늘",
    YESTERDAY: "어제",
    DIFFERENCE: "차이",
} as const;

// ========================================
// 카테고리 옵션
// ========================================
export const RECORD_CATEGORY_OPTIONS = [
    { value: "개발", label: "개발" },
    { value: "문서작업", label: "문서작업" },
    { value: "회의", label: "회의" },
    { value: "환경세팅", label: "환경세팅" },
    { value: "코드리뷰", label: "코드리뷰" },
    { value: "테스트", label: "테스트" },
    { value: "기타", label: "기타" },
] as const;

// ========================================
// 폼 레이블
// ========================================
export const RECORD_FORM_LABEL = {
    PROJECT_CODE: "프로젝트 코드",
    WORK_NAME: "작업명",
    TASK_NAME: "업무명",
    CATEGORY: "카테고리",
    DEAL_NAME: "거래명",
    NOTE: "비고",
    START_TIME: "시작 시간",
    END_TIME: "종료 시간",
    DATE: "날짜",
    DURATION: "소요 시간",
} as const;

// ========================================
// UI 텍스트
// ========================================
export const RECORD_UI_TEXT = {
    CARD_TITLE: "작업 기록",
    TIMER_RUNNING_SUFFIX: "진행 중",
    EMPTY_VALUE: "-",
    TIME_SEPARATOR: " ~ ",
    MINUTE_UNIT: "분",
    TODAY_TEXT: "오늘",
} as const;

// ========================================
// 마크다운 복사 관련
// ========================================
export const MARKDOWN_COPY = {
    COLUMNS: ["거래명", "작업명", "시간", "카테고리", "비고"],
    CELL_PREFIX: "| ",
    CELL_SEPARATOR: " | ",
    CELL_SUFFIX: " |",
    ROW_SEPARATOR: "|",
    HEADER_SEPARATOR: "-",
    LINE_BREAK: "\n",
    PADDING_WIDTH: 2,
} as const;
