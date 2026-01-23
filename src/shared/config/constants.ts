/**
 * 앱 전역 상수 정의
 */

/**
 * 기본 업무명 옵션
 */
export const DEFAULT_TASK_OPTIONS = [
    "개발",
    "작업",
    "분석",
    "설계",
    "테스트",
    "기타",
] as const;

/**
 * 기본 카테고리명 옵션
 */
export const DEFAULT_CATEGORY_OPTIONS = [
    "개발",
    "문서작업",
    "회의",
    "환경세팅",
    "코드리뷰",
    "테스트",
    "기타",
] as const;

/**
 * 템플릿 색상 팔레트
 */
export const TEMPLATE_COLORS = [
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
    "#a0d911",
    "#2f54eb",
] as const;

/**
 * 프로젝트 코드 기본값
 */
export const DEFAULT_PROJECT_CODE = "A00_00000";

/**
 * 카테고리별 색상 매핑
 */
export const CATEGORY_COLORS: Record<string, string> = {
    개발: "green",
    문서작업: "orange",
    회의: "purple",
    환경세팅: "cyan",
    코드리뷰: "magenta",
    테스트: "blue",
    기타: "default",
};

/**
 * 카테고리 색상 가져오기
 */
export function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || "default";
}

/**
 * LocalStorage 키
 */
export const STORAGE_KEYS = {
    WORK_TIME: "work-time-storage",
    SHORTCUT: "shortcut-storage",
    PENDING_SYNC: "time_manager_pending_sync",
} as const;

/**
 * 관리업무 프로젝트 코드
 */
export const ADMIN_PROJECT_CODE = "A24_05591";

/**
 * 관리자 이메일
 */
export const ADMIN_EMAIL = "rlaxo0306@gmail.com";
