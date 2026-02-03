/**
 * 앱 전역 상수 정의
 *
 * 새로운 상수 구조에서 re-export합니다.
 * 이 파일은 기존 import 경로 호환성을 위해 유지됩니다.
 */

// ============================================
// 앱 기본값
// ============================================
export {
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    DEFAULT_PROJECT_CODE,
} from "@/shared/constants/app";

// ============================================
// 색상 상수
// ============================================
export {
    TEMPLATE_COLORS,
    CATEGORY_COLORS,
    getCategoryColor,
} from "@/shared/constants/style";

// ============================================
// 스토리지 키
// ============================================
export { STORAGE_KEYS } from "@/shared/constants/app";

// ============================================
// 관리자 정보
// ============================================
export { ADMIN_PROJECT_CODE, ADMIN_EMAIL } from "@/shared/constants/app";
