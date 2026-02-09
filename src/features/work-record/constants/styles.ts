/**
 * Work Record 관련 스타일 상수
 * CSSProperties → Tailwind 마이그레이션 후 Ant Design prop 값만 유지
 */

// ========================================
// 테이블 컬럼 너비 (Ant Design Table column width prop)
// ========================================
export const RECORD_COLUMN_WIDTH = {
    TIMER_ACTION: 50,
    DEAL_NAME: 200,
    WORK_NAME: 120,
    TASK_NAME: 80,
    CATEGORY: 90,
    DURATION: 60,
    TIME_RANGE: 120,
    DATE: 90,
    ACTIONS: 120,
} as const;

// ========================================
// 간격 (Ant Design Space size, Row gutter prop)
// ========================================
export const RECORD_SPACING = {
    NONE: 0,
    TINY: 4,
    SMALL: 8,
    MEDIUM: 12,
    DEFAULT: 16,
    LARGE: 24,
} as const;
