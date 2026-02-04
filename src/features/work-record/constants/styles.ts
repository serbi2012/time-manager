/**
 * Work Record 관련 스타일 상수
 */

import type { CSSProperties } from "react";

// ========================================
// 색상
// ========================================
export const RECORD_COLORS = {
    PRIMARY: "#1890ff",
    SUCCESS: "#52c41a",
    WARNING: "#faad14",
    ERROR: "#ff4d4f",
    GRAY: "#8c8c8c",
    TEXT_PRIMARY: "rgba(0, 0, 0, 0.88)",
    TEXT_SECONDARY: "rgba(0, 0, 0, 0.65)",
    TEXT_DISABLED: "rgba(0, 0, 0, 0.25)",
    BORDER: "#d9d9d9",
} as const;

// ========================================
// 크기
// ========================================
export const RECORD_SIZE = {
    TABLE_ROW_HEIGHT: 54,
    INPUT_HEIGHT_SMALL: 24,
    INPUT_HEIGHT_DEFAULT: 32,
    BUTTON_HEIGHT_SMALL: 24,
    BUTTON_HEIGHT_DEFAULT: 32,
    ICON_SIZE_SMALL: 12,
    ICON_SIZE_DEFAULT: 14,
    ICON_SIZE_LARGE: 16,
} as const;

// ========================================
// 간격
// ========================================
export const RECORD_SPACING = {
    SMALL: 8,
    DEFAULT: 16,
    LARGE: 24,
} as const;

// ========================================
// 공통 스타일
// ========================================

/** 컨테이너 스타일 */
export const RECORD_CONTAINER_STYLE: CSSProperties = {
    padding: RECORD_SPACING.DEFAULT,
} as const;

/** 헤더 스타일 */
export const RECORD_HEADER_STYLE: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: RECORD_SPACING.DEFAULT,
} as const;

/** 필터 영역 스타일 */
export const RECORD_FILTER_STYLE: CSSProperties = {
    marginBottom: RECORD_SPACING.DEFAULT,
    display: "flex",
    gap: RECORD_SPACING.SMALL,
    flexWrap: "wrap",
} as const;

/** 통계 카드 스타일 */
export const RECORD_STATS_CARD_STYLE: CSSProperties = {
    marginBottom: RECORD_SPACING.DEFAULT,
} as const;

/** 테이블 셀 스타일 (공통) */
export const RECORD_CELL_STYLE: CSSProperties = {
    padding: "8px",
} as const;

/** 텍스트 스타일 */
export const RECORD_TEXT_PRIMARY_STYLE: CSSProperties = {
    color: RECORD_COLORS.TEXT_PRIMARY,
} as const;

export const RECORD_TEXT_SECONDARY_STYLE: CSSProperties = {
    color: RECORD_COLORS.TEXT_SECONDARY,
    fontSize: 12,
} as const;

export const RECORD_TEXT_DISABLED_STYLE: CSSProperties = {
    color: RECORD_COLORS.TEXT_DISABLED,
} as const;

/** 인풋 스타일 */
export const RECORD_INPUT_SMALL_STYLE: CSSProperties = {
    height: RECORD_SIZE.INPUT_HEIGHT_SMALL,
    fontSize: 12,
} as const;

export const RECORD_INPUT_STYLE: CSSProperties = {
    height: RECORD_SIZE.INPUT_HEIGHT_DEFAULT,
} as const;

/** 버튼 스타일 */
export const RECORD_BUTTON_SMALL_STYLE: CSSProperties = {
    height: RECORD_SIZE.BUTTON_HEIGHT_SMALL,
    fontSize: 12,
} as const;

/** Duration 표시 스타일 */
export const RECORD_DURATION_CONTAINER_STYLE: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
} as const;

export const RECORD_DURATION_TEXT_STYLE: CSSProperties = {
    fontWeight: "500",
} as const;

export const RECORD_DURATION_OVERTIME_BADGE_STYLE: CSSProperties = {
    backgroundColor: RECORD_COLORS.WARNING,
    color: "#fff",
} as const;

/** 액션 버튼 그룹 스타일 */
export const RECORD_ACTIONS_CONTAINER_STYLE: CSSProperties = {
    display: "flex",
    gap: 4,
} as const;

/** 세션 정보 스타일 */
export const RECORD_SESSION_INFO_STYLE: CSSProperties = {
    fontSize: 12,
    color: RECORD_COLORS.TEXT_SECONDARY,
    marginTop: 4,
} as const;

/** 카테고리 태그 스타일 */
export const RECORD_CATEGORY_TAG_STYLE: CSSProperties = {
    marginRight: 0,
} as const;

/** 검색 입력 스타일 */
export const RECORD_SEARCH_INPUT_STYLE: CSSProperties = {
    width: 200,
} as const;

/** 날짜 네비게이션 스타일 */
export const RECORD_DATE_NAV_STYLE: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
} as const;

/** 빈 상태 스타일 */
export const RECORD_EMPTY_STYLE: CSSProperties = {
    padding: "40px 0",
    textAlign: "center",
    color: RECORD_COLORS.TEXT_SECONDARY,
} as const;
