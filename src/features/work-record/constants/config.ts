/**
 * Work Record 관련 설정 상수
 */

// ========================================
// 시간 관련
// ========================================

/** 최소 작업 시간 (분) */
export const MIN_WORK_DURATION_MINUTES = 1;

/** 최대 작업 시간 (분) - 24시간 */
export const MAX_WORK_DURATION_MINUTES = 1440;

/** 초과 근무 기준 시간 (분) - 8시간 */
export const OVERTIME_THRESHOLD_MINUTES = 480;

/** 기본 시작 시간 */
export const DEFAULT_START_TIME = "09:00";

/** 기본 종료 시간 */
export const DEFAULT_END_TIME = "18:00";

/** 시간 입력 형식 */
export const TIME_FORMAT = "HH:mm";

/** 날짜 입력 형식 */
export const DATE_FORMAT = "YYYY-MM-DD";

/** 날짜 표시 형식 (요일 포함) */
export const DATE_FORMAT_WITH_DAY = "YYYY-MM-DD (dd)";

// ========================================
// 테이블 관련
// ========================================

/** 테이블 페이지 크기 */
export const TABLE_PAGE_SIZE = 20;

/** 테이블 최소 높이 */
export const TABLE_MIN_HEIGHT = 400;

/** 모바일 테이블 페이지 크기 */
export const MOBILE_TABLE_PAGE_SIZE = 10;

// ========================================
// 검색 관련
// ========================================

/** 검색 디바운스 시간 (ms) */
export const SEARCH_DEBOUNCE_MS = 300;

/** 최소 검색 문자 수 */
export const MIN_SEARCH_LENGTH = 1;

// ========================================
// 필터 관련
// ========================================

/** 기본 필터 상태 */
export const DEFAULT_FILTER_STATE = {
    search: "",
    category: null as string | null,
    show_completed: false,
} as const;

// ========================================
// 폼 관련
// ========================================

/** 기본 프로젝트 코드 (미입력 시 사용) */
export const DEFAULT_PROJECT_CODE = "A00_00000";

/** 기본 폼 데이터 */
export const DEFAULT_RECORD_FORM_DATA = {
    project_code: "",
    work_name: "",
    task_name: "",
    category_name: "",
    deal_name: "",
    note: "",
    start_time: DEFAULT_START_TIME,
    end_time: DEFAULT_END_TIME,
} as const;

/** 폼 검증 규칙 */
export const FORM_VALIDATION = {
    work_name: {
        required: true,
        min: 1,
        max: 100,
    },
    deal_name: {
        required: false,
        max: 100,
    },
    note: {
        required: false,
        max: 500,
    },
} as const;

// ========================================
// 세션 관련
// ========================================

/** 세션 테이블 컬럼 너비 */
export const SESSION_TABLE_COLUMN_WIDTH = {
    INDEX: 50,
    DATE: 120,
    START_TIME: 100,
    END_TIME: 100,
    DURATION: 100,
    ACTIONS: 80,
} as const;

// ========================================
// 기타
// ========================================

/** 자동 저장 지연 시간 (ms) */
export const AUTO_SAVE_DELAY_MS = 1000;

/** 타이머 업데이트 간격 (ms) */
export const TIMER_UPDATE_INTERVAL_MS = 1000;

/** 최대 세션 개수 */
export const MAX_SESSIONS_PER_RECORD = 50;

/** 한글/영문 구분 임계값 (charCodeAt) */
export const CHAR_CODE_THRESHOLD = 127;

/** 한글 문자 너비 (바이트) */
export const HANGUL_CHAR_WIDTH = 2;

/** 영문 문자 너비 (바이트) */
export const ASCII_CHAR_WIDTH = 1;

/** 날짜 슬라이스 시작 인덱스 (MM-DD 추출) */
export const DATE_SLICE_START = 5;

/** 시간 슬라이스 끝 인덱스 (HH:mm 추출) */
export const TIME_SLICE_END = 5;
