/**
 * 테마 관련 상수 및 타입
 */

// ============================================
// 앱 테마
// ============================================

/** 앱 테마 값 */
export const AppTheme = {
    Blue: "blue",
    Green: "green",
    Purple: "purple",
    Red: "red",
    Orange: "orange",
    Teal: "teal",
    Black: "black",
} as const;

/** 앱 테마 타입 */
export type AppTheme = (typeof AppTheme)[keyof typeof AppTheme];

/** 모든 테마 값 배열 */
export const APP_THEME_VALUES = Object.values(AppTheme);

// ============================================
// 트랜지션 속도
// ============================================

/** 트랜지션 속도 값 */
export const TransitionSpeed = {
    Slow: "slow",
    Normal: "normal",
    Fast: "fast",
} as const;

/** 트랜지션 속도 타입 */
export type TransitionSpeed =
    (typeof TransitionSpeed)[keyof typeof TransitionSpeed];

/** 모든 트랜지션 속도 값 배열 */
export const TRANSITION_SPEED_VALUES = Object.values(TransitionSpeed);

// ============================================
// 기본값
// ============================================

/** 기본 앱 테마 */
export const DEFAULT_APP_THEME: AppTheme = AppTheme.Blue;

/** 기본 트랜지션 활성화 여부 */
export const DEFAULT_TRANSITION_ENABLED = false;

/** 기본 트랜지션 속도 */
export const DEFAULT_TRANSITION_SPEED: TransitionSpeed = TransitionSpeed.Normal;
