/**
 * 트랜지션 공통 설정
 */

/** 트랜지션 속도 타입 */
export type TransitionSpeed = "slow" | "normal" | "fast";

/** 속도별 duration 매핑 */
export const TRANSITION_SPEED_DURATION: Record<TransitionSpeed, number> = {
  slow: 0.7,
  normal: 0.5,
  fast: 0.25,
};

/** 속도별 stagger 매핑 */
export const TRANSITION_SPEED_STAGGER: Record<TransitionSpeed, number> = {
  slow: 0.15,
  normal: 0.1,
  fast: 0.05,
};

/** 속도 레이블 */
export const TRANSITION_SPEED_LABELS: Record<TransitionSpeed, string> = {
  slow: "느리게",
  normal: "보통",
  fast: "빠르게",
};

/** 트랜지션 기본 설정 */
export const TRANSITION_CONFIG = {
  /** 애니메이션 지속 시간 (초) */
  duration: 0.5,
  /** 이징 곡선 - cubic-bezier ease-out */
  ease: [0.25, 0.1, 0.25, 1] as const,
  /** 순차 애니메이션 딜레이 (초) */
  stagger: 0.1,
} as const;

/** 슬라이드 방향별 초기 오프셋 */
export const SLIDE_DIRECTIONS = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
} as const;

/** 슬라이드 방향 타입 */
export type SlideDirection = keyof typeof SLIDE_DIRECTIONS;

/** 페이지별 트랜지션 딜레이 설정 (초) */
export const PAGE_TRANSITION_DELAYS = {
    /** 데스크탑 일간 페이지 */
    desktop_daily: {
        header: 0,
        sidebar: 0.1,
        gantt: 0.2,
        table: 0.3,
    },
    /** 모바일 일간 페이지 */
    mobile_daily: {
        header: 0,
        content: 0.15,
    },
} as const;
