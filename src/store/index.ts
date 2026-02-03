/**
 * 스토어 모듈 Public API
 *
 * @example
 * import { useWorkStore, useShortcutStore } from '@/store';
 */

// 스토어
export { useWorkStore } from "./useWorkStore";
export { useShortcutStore } from "./useShortcutStore";

// 상수
export {
    TEMPLATE_COLORS,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    DEFAULT_PROJECT_CODE,
    APP_THEME_COLORS,
    APP_THEME_LABELS,
    DEFAULT_FORM_DATA,
    DEFAULT_TIMER,
    DEFAULT_HIDDEN_AUTOCOMPLETE_OPTIONS,
    DEFAULT_LUNCH_START_TIME,
    DEFAULT_LUNCH_END_TIME,
    DEFAULT_APP_THEME,
    DEFAULT_TRANSITION_ENABLED,
    DEFAULT_TRANSITION_SPEED,
    DEFAULT_USE_POSTFIX_ON_PRESET_ADD,
} from "./constants";

// 타입
export type {
    WorkStore,
    RecordsSlice,
    TemplatesSlice,
    TimerSlice,
    SettingsSlice,
    FormSlice,
    UiSlice,
    AppTheme,
    TransitionSpeed,
    HiddenAutoCompleteField,
} from "./types";

// 단축키 스토어 타입/상수
export type { ShortcutDefinition } from "./useShortcutStore";
export { DEFAULT_SHORTCUTS, CATEGORY_LABELS } from "./useShortcutStore";
