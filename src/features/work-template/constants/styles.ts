import type { CSSProperties } from "react";

/**
 * 템플릿 리스트 스타일 상수
 */

// 버튼 스타일
export const ADD_BUTTON_WRAPPER_STYLE: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
};

export const SHORTCUT_BADGE_STYLE: CSSProperties = {
    fontSize: 10,
    opacity: 0.85,
    marginLeft: 4,
    padding: "1px 4px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: 3,
};

// Empty 상태 스타일
export const EMPTY_SECONDARY_TEXT_STYLE: CSSProperties = {
    fontSize: 12,
};
