/**
 * 색상 상수 (Toss-Inspired)
 */

import type { AppTheme } from "../enums/theme";

// ============================================
// 그레이스케일 (Toss Gray)
// ============================================

/** Toss-Inspired 그레이스케일 */
export const GRAY = {
    50: "#F9FAFB",
    100: "#F2F4F6",
    200: "#E5E8EB",
    300: "#D1D6DB",
    400: "#B0B8C1",
    500: "#8B95A1",
    600: "#6B7684",
    700: "#4E5968",
    800: "#333D4B",
    900: "#191F28",
} as const;

// ============================================
// 시맨틱 색상
// ============================================

/** 시맨틱 색상 */
export const SEMANTIC_COLORS = {
    /** 성공 */
    success: "#34C759",
    /** 에러 */
    error: "#F04452",
    /** 경고 */
    warning: "#FF9500",
    /** 정보 */
    info: "#3182F6",
    /** 비활성화 */
    disabled: "#D1D6DB",
} as const;

// ============================================
// 텍스트 색상
// ============================================

/** 텍스트 색상 */
export const TEXT_COLORS = {
    /** 기본 텍스트 */
    primary: "#191F28",
    /** 보조 텍스트 */
    secondary: "#6B7684",
    /** 비활성 텍스트 */
    disabled: "#B0B8C1",
    /** 힌트/플레이스홀더 */
    hint: "#D1D6DB",
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
    light: "#F9FAFB",
    /** 회색 배경 */
    grey: "#F2F4F6",
    /** 어두운 배경 */
    dark: "#191F28",
} as const;

// ============================================
// 경계선 색상
// ============================================

/** 경계선 색상 */
export const BORDER_COLORS = {
    /** 기본 경계선 */
    default: "#E5E8EB",
    /** 밝은 경계선 */
    light: "#F2F4F6",
    /** 어두운 경계선 */
    dark: "#D1D6DB",
} as const;

// ============================================
// 템플릿 색상
// ============================================

/** 템플릿 색상 팔레트 */
export const TEMPLATE_COLORS: string[] = [
    "#3182F6",
    "#34C759",
    "#FF9500",
    "#F04452",
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
        primary: "#3182F6",
        gradient: "linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)",
        gradientDark: "#1B64DA",
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
