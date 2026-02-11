/**
 * 스토어 상수 정의
 *
 * 새로운 상수 구조에서 re-export합니다.
 * 이 파일은 기존 import 경로 호환성을 위해 유지됩니다.
 */

// ============================================
// 앱 기본값 (from shared/constants/app)
// ============================================
export {
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    DEFAULT_PROJECT_CODE,
    DEFAULT_FORM_DATA,
    DEFAULT_TIMER,
    DEFAULT_HIDDEN_AUTOCOMPLETE_OPTIONS,
    DEFAULT_USE_POSTFIX_ON_PRESET_ADD,
    DEFAULT_MOBILE_GANTT_LIST_EXPANDED,
} from "@/shared/constants/app";

// ============================================
// 테마 및 트랜지션 (from shared/constants/enums)
// ============================================
export {
    AppTheme,
    type AppTheme as AppThemeType,
    TransitionSpeed,
    type TransitionSpeed as TransitionSpeedType,
    DEFAULT_APP_THEME,
    DEFAULT_TRANSITION_ENABLED,
    DEFAULT_TRANSITION_SPEED,
} from "@/shared/constants/enums";

// ============================================
// 시간 상수 (from shared/constants/time)
// ============================================
export {
    DEFAULT_LUNCH_START_TIME,
    DEFAULT_LUNCH_END_TIME,
} from "@/shared/constants/time";

// ============================================
// 색상 상수 (from shared/constants/style)
// ============================================
export {
    TEMPLATE_COLORS,
    APP_THEME_COLORS,
    APP_THEME_LABELS,
} from "@/shared/constants/style";
