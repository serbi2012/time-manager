/**
 * 색상 상수
 */

import type { AppTheme } from "../enums/theme";

// ============================================
// 시맨틱 색상
// ============================================

/** 시맨틱 색상 */
export const SEMANTIC_COLORS = {
    /** 성공 */
    success: "#52c41a",
    /** 에러 */
    error: "#ff4d4f",
    /** 경고 */
    warning: "#faad14",
    /** 정보 */
    info: "#1890ff",
    /** 비활성화 */
    disabled: "#d9d9d9",
} as const;

// ============================================
// 텍스트 색상
// ============================================

/** 텍스트 색상 */
export const TEXT_COLORS = {
    /** 기본 텍스트 */
    primary: "rgba(0, 0, 0, 0.85)",
    /** 보조 텍스트 */
    secondary: "rgba(0, 0, 0, 0.65)",
    /** 비활성 텍스트 */
    disabled: "rgba(0, 0, 0, 0.45)",
    /** 힌트/플레이스홀더 */
    hint: "rgba(0, 0, 0, 0.25)",
    /** 흰색 텍스트 */
    white: "#ffffff",
} as const;

// ============================================
// 배경 색상
// ============================================

/** 배경 색상 */
export const BACKGROUND_COLORS = {
    /** 기본 배경 */
    default: "#ffffff",
    /** 밝은 회색 배경 */
    light: "#fafafa",
    /** 회색 배경 */
    grey: "#f5f5f5",
    /** 어두운 배경 */
    dark: "#001529",
} as const;

// ============================================
// 경계선 색상
// ============================================

/** 경계선 색상 */
export const BORDER_COLORS = {
    /** 기본 경계선 */
    default: "#d9d9d9",
    /** 밝은 경계선 */
    light: "#f0f0f0",
    /** 어두운 경계선 */
    dark: "#bfbfbf",
} as const;

// ============================================
// 템플릿 색상
// ============================================

/** 템플릿 색상 팔레트 */
export const TEMPLATE_COLORS: string[] = [
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
];

// ============================================
// 카테고리 색상
// ============================================

/** 카테고리별 색상 매핑 */
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

// ============================================
// 테마 색상
// ============================================

/** 테마 색상 인터페이스 */
export interface ThemeColors {
    /** Ant Design colorPrimary */
    primary: string;
    /** 헤더 그라데이션 */
    gradient: string;
    /** 어두운 그라데이션 (그림자용) */
    gradientDark: string;
}

/** 앱 테마별 색상 정의 */
export const APP_THEME_COLORS: Record<AppTheme, ThemeColors> = {
    blue: {
        primary: "#1890ff",
        gradient: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
        gradientDark: "#096dd9",
    },
    green: {
        primary: "#52c41a",
        gradient: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
        gradientDark: "#389e0d",
    },
    purple: {
        primary: "#722ed1",
        gradient: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
        gradientDark: "#531dab",
    },
    red: {
        primary: "#f5222d",
        gradient: "linear-gradient(135deg, #f5222d 0%, #cf1322 100%)",
        gradientDark: "#cf1322",
    },
    orange: {
        primary: "#fa8c16",
        gradient: "linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)",
        gradientDark: "#d46b08",
    },
    teal: {
        primary: "#13c2c2",
        gradient: "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
        gradientDark: "#08979c",
    },
    black: {
        primary: "#434343",
        gradient: "linear-gradient(135deg, #434343 0%, #1a1a1a 100%)",
        gradientDark: "#1a1a1a",
    },
};

/** 테마 라벨 (한글) */
export const APP_THEME_LABELS: Record<AppTheme, string> = {
    blue: "파란색 (기본)",
    green: "초록색",
    purple: "보라색",
    red: "빨간색",
    orange: "주황색",
    teal: "청록색",
    black: "검정색",
};
