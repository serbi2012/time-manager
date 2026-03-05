/**
 * UI 텍스트 상수
 */

export * from "./buttons";
export * from "./messages";
export * from "./labels";
export * from "./modals";
export * from "./placeholders";

// 통합 UI 텍스트 객체
import { BUTTON_TEXT } from "./buttons";
import { MESSAGES } from "./messages";
import {
    FORM_LABELS,
    TABLE_COLUMNS,
    TOOLTIP_TEXT,
    TAB_LABELS,
    NAV_LABELS,
    APP_LABELS,
    SYNC_LABELS,
    LOADING_LABELS,
    DATE_FORMAT_LABELS,
    TIME_DISPLAY_LABELS,
    STATUS_LABELS,
    TRANSITION_LABELS,
    PRESET_LABELS,
    FORM_ADD_LABELS,
    SHORTCUT_LABELS,
    SHORTCUT_CATEGORIES,
} from "./labels";
import { MODAL_TITLES, POPCONFIRM_TEXT } from "./modals";
import { PLACEHOLDERS, EMPTY_MESSAGES } from "./placeholders";

export const UI_TEXT = {
    buttons: BUTTON_TEXT,
    messages: MESSAGES,
    labels: {
        form: FORM_LABELS,
        table: TABLE_COLUMNS,
        tooltip: TOOLTIP_TEXT,
        tab: TAB_LABELS,
        nav: NAV_LABELS,
        app: APP_LABELS,
        sync: SYNC_LABELS,
        loading: LOADING_LABELS,
        date: DATE_FORMAT_LABELS,
        time: TIME_DISPLAY_LABELS,
        status: STATUS_LABELS,
        transition: TRANSITION_LABELS,
        preset: PRESET_LABELS,
        formAdd: FORM_ADD_LABELS,
        shortcut: SHORTCUT_LABELS,
        shortcutCategories: SHORTCUT_CATEGORIES,
    },
    modals: {
        titles: MODAL_TITLES,
        popconfirm: POPCONFIRM_TEXT,
    },
    placeholders: PLACEHOLDERS,
    empty: EMPTY_MESSAGES,
} as const;
