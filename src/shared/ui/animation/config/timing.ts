/**
 * 애니메이션 타이밍 상수
 * 토스 스타일의 생동감 있는 애니메이션을 위한 설정
 */

/** 애니메이션 지속 시간 (ms) */
export const DURATION = {
    /** 즉시 (0ms) */
    instant: 0,
    /** 매우 빠름 (100ms) - 미세한 피드백 */
    fastest: 100,
    /** 빠름 (200ms) - 버튼 클릭, 호버 */
    fast: 200,
    /** 일반 (300ms) - 대부분의 전환 */
    normal: 300,
    /** 느림 (400ms) - 모달, 드로어 */
    slow: 400,
    /** 더 느림 (500ms) - 페이지 전환 */
    slower: 500,
    /** 가장 느림 (700ms) - 복잡한 애니메이션 */
    slowest: 700,
} as const;

/** 애니메이션 지연 시간 (ms) */
export const DELAY = {
    /** 없음 */
    none: 0,
    /** 짧음 (50ms) */
    short: 50,
    /** 일반 (100ms) */
    normal: 100,
    /** 길음 (200ms) */
    long: 200,
    /** 매우 긺 (300ms) */
    longer: 300,
} as const;

/** 순차 애니메이션 딜레이 (ms) */
export const STAGGER = {
    /** 빠른 순차 (30ms) - 짧은 리스트 */
    fast: 30,
    /** 일반 순차 (50ms) - 대부분의 리스트 */
    normal: 50,
    /** 느린 순차 (80ms) - 강조가 필요한 리스트 */
    slow: 80,
    /** 매우 느린 순차 (100ms) - 드라마틱한 효과 */
    slower: 100,
} as const;

export type Duration = (typeof DURATION)[keyof typeof DURATION];
export type Delay = (typeof DELAY)[keyof typeof DELAY];
export type Stagger = (typeof STAGGER)[keyof typeof STAGGER];
