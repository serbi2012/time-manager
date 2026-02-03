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
import { FORM_LABELS, TABLE_COLUMNS, TOOLTIP_TEXT, TAB_LABELS } from "./labels";
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
    },
    modals: {
        titles: MODAL_TITLES,
        popconfirm: POPCONFIRM_TEXT,
    },
    placeholders: PLACEHOLDERS,
    empty: EMPTY_MESSAGES,
} as const;
