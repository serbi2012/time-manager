/**
 * 앱 테마 관련 설정
 */

/**
 * 앱 테마 타입
 */
export type AppTheme = 
    | "blue" 
    | "green" 
    | "purple" 
    | "red" 
    | "orange" 
    | "teal" 
    | "black";

/**
 * 테마별 색상 정의
 */
export interface ThemeColors {
    primary: string;       // Ant Design colorPrimary
    gradient: string;      // 헤더 그라데이션
    gradientDark: string;  // 어두운 그라데이션 (그림자용)
}

/**
 * 앱 테마 색상 정의
 */
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

/**
 * 테마 라벨 (한국어)
 */
export const APP_THEME_LABELS: Record<AppTheme, string> = {
    blue: "파란색 (기본)",
    green: "초록색",
    purple: "보라색",
    red: "빨간색",
    orange: "주황색",
    teal: "청록색",
    black: "검정색",
};

/**
 * 기본 테마
 */
export const DEFAULT_APP_THEME: AppTheme = "blue";
