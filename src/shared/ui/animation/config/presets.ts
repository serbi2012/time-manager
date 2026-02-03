/**
 * 애니메이션 프리셋
 * 자주 사용되는 애니메이션 패턴 정의
 */
import type { Variants, Transition } from "framer-motion";
import { DURATION } from "./timing";
import { SPRING } from "./easing";

// ============================================================================
// 페이드 프리셋
// ============================================================================

export const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: DURATION.fast / 1000 },
} as const;

export const FADE_SCALE = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: SPRING.snappy,
} as const;

// ============================================================================
// 슬라이드 프리셋
// ============================================================================

export const SLIDE = {
    up: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: SPRING.toss,
    },
    down: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: SPRING.toss,
    },
    left: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10 },
        transition: SPRING.toss,
    },
    right: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 },
        transition: SPRING.toss,
    },
} as const;

// ============================================================================
// 스케일 프리셋
// ============================================================================

export const SCALE = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: SPRING.snappy,
} as const;

export const SCALE_BOUNCE = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: SPRING.bouncy,
} as const;

// ============================================================================
// 리스트 아이템 프리셋
// ============================================================================

export const LIST_ITEM: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export const LIST_ITEM_SLIDE: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
};

// ============================================================================
// 인터랙션 프리셋
// ============================================================================

/** 버튼 프레스 효과 */
export const PRESS = {
    whileTap: { scale: 0.97 },
    transition: { duration: 0.1 },
} as const;

/** 강한 프레스 효과 */
export const PRESS_STRONG = {
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 },
} as const;

/** 호버 효과 */
export const HOVER = {
    whileHover: { scale: 1.02 },
    transition: SPRING.snappy,
} as const;

/** 호버 + 상승 효과 */
export const HOVER_LIFT = {
    whileHover: { scale: 1.02, y: -2 },
    transition: SPRING.snappy,
} as const;

/** 카드 호버 효과 */
export const HOVER_CARD = {
    whileHover: {
        scale: 1.02,
        y: -4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    },
    transition: SPRING.gentle,
} as const;

// ============================================================================
// 모달/드로어 프리셋
// ============================================================================

export const MODAL = {
    overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DURATION.fast / 1000 },
    },
    content: {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: SPRING.toss,
    },
} as const;

export const DRAWER = {
    left: {
        initial: { x: "-100%" },
        animate: { x: 0 },
        exit: { x: "-100%" },
        transition: SPRING.toss,
    },
    right: {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: SPRING.toss,
    },
    bottom: {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: SPRING.toss,
    },
} as const;

// ============================================================================
// 페이지 전환 프리셋
// ============================================================================

export const PAGE_TRANSITION = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DURATION.normal / 1000 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: SPRING.elegant,
    },
    slideLeft: {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: SPRING.elegant,
    },
} as const;

// ============================================================================
// 피드백 프리셋
// ============================================================================

/** 성공 체크마크 */
export const SUCCESS_CHECK = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: SPRING.bouncy,
} as const;

/** 에러 흔들림 */
export const ERROR_SHAKE: Variants = {
    initial: { x: 0 },
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
    },
};

/** 펄스 효과 */
export const PULSE: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.3, repeat: 2 },
    },
};

// ============================================================================
// 타입 정의
// ============================================================================

export type PresetType =
    | "fade"
    | "fadeScale"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scale"
    | "scaleBounce";

/** 프리셋 이름으로 값 가져오기 */
export function getPreset(name: PresetType) {
    const presets = {
        fade: FADE,
        fadeScale: FADE_SCALE,
        slideUp: SLIDE.up,
        slideDown: SLIDE.down,
        slideLeft: SLIDE.left,
        slideRight: SLIDE.right,
        scale: SCALE,
        scaleBounce: SCALE_BOUNCE,
    };

    return presets[name];
}
