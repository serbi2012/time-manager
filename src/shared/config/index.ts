/**
 * 공유 설정/상수 모음
 * 
 * @example
 * import { DEFAULT_TASK_OPTIONS, TEMPLATE_COLORS } from '@/shared/config';
 * import { APP_THEME_COLORS, type AppTheme } from '@/shared/config';
 */

// 상수
export {
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    TEMPLATE_COLORS,
    DEFAULT_PROJECT_CODE,
    CATEGORY_COLORS,
    getCategoryColor,
    STORAGE_KEYS,
    ADMIN_PROJECT_CODE,
    ADMIN_EMAIL,
} from "./constants";

// 테마
export {
    type AppTheme,
    type ThemeColors,
    APP_THEME_COLORS,
    APP_THEME_LABELS,
    DEFAULT_APP_THEME,
} from "./theme";
