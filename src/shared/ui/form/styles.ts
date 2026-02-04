/**
 * 폼 관련 공통 스타일 상수
 */

import type { CSSProperties } from "react";

/**
 * AutoComplete/Select 옵션 레이블 컨테이너
 */
export const OPTION_LABEL_CONTAINER_STYLE: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

/**
 * Select dropdown 추가 입력 영역
 */
export const DROPDOWN_ADD_SECTION_STYLE: CSSProperties = {
    padding: "0 8px 4px",
    width: "100%",
};

/**
 * Divider 스타일 (dropdown 내)
 */
export const DROPDOWN_DIVIDER_STYLE: CSSProperties = {
    margin: "8px 0",
};

/**
 * Space 전체 너비
 */
export const SPACE_FULL_WIDTH_STYLE: CSSProperties = {
    width: "100%",
};

/**
 * Input flex 1
 */
export const INPUT_FLEX_STYLE: CSSProperties = {
    flex: 1,
};

/**
 * 세션 시간 섹션 컨테이너
 */
export const SESSION_TIME_CONTAINER_STYLE: CSSProperties = {
    marginBottom: 16,
    padding: 12,
    background: "#f5f5f5",
    borderRadius: 8,
};

/**
 * 세션 시간 헤더
 */
export const SESSION_TIME_HEADER_STYLE: CSSProperties = {
    marginBottom: 8,
    fontWeight: 500,
    fontSize: 13,
    color: "#666",
};

/**
 * Form.Item marginBottom 0
 */
export const FORM_ITEM_NO_MARGIN_STYLE: CSSProperties = {
    marginBottom: 0,
};

/**
 * Radio 카드 스타일 (기본)
 */
export const RADIO_CARD_BASE_STYLE: CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d9d9d9",
    borderRadius: 6,
};

/**
 * Radio 카드 스타일 (선택됨)
 */
export const RADIO_CARD_SELECTED_STYLE: CSSProperties = {
    ...RADIO_CARD_BASE_STYLE,
    backgroundColor: "#e6f4ff",
};

/**
 * Radio 카드 스타일 (선택 안됨)
 */
export const RADIO_CARD_UNSELECTED_STYLE: CSSProperties = {
    ...RADIO_CARD_BASE_STYLE,
    backgroundColor: "transparent",
};

/**
 * Secondary text with margin
 */
export const TEXT_SECONDARY_WITH_MARGIN_STYLE: CSSProperties = {
    marginLeft: 8,
};

/**
 * Text block with margin
 */
export const TEXT_BLOCK_WITH_MARGIN_STYLE: CSSProperties = {
    display: "block",
    marginBottom: 12,
};

/**
 * Modal title secondary text
 */
export const MODAL_TITLE_SECONDARY_STYLE: CSSProperties = {
    fontWeight: "normal",
};

/**
 * Hint text style
 */
export const HINT_TEXT_STYLE: CSSProperties = {
    marginTop: 8,
};
