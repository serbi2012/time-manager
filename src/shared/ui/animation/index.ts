/**
 * 애니메이션 시스템
 * 토스 스타일의 생동감 있는 애니메이션을 위한 컴포넌트와 훅
 *
 * @example
 * // 기본 사용
 * import { AnimatedPresence, AnimatedList, AnimatedNumber } from '@/shared/ui/animation';
 *
 * // 프리셋 사용
 * import { SLIDE, SPRING, DURATION } from '@/shared/ui/animation';
 *
 * // 훅 사용
 * import { useAnimationConfig, useStaggerAnimation } from '@/shared/ui/animation';
 */

// Config
export * from "./config";

// Primitives
export * from "./primitives";

// Interactions
export * from "./interactions";

// Feedback
export * from "./feedback";

// Hooks
export * from "./hooks";

// Re-export framer-motion essentials for convenience
export {
    motion,
    AnimatePresence,
    useAnimation,
    useMotionValue,
    useTransform,
    useSpring,
} from "framer-motion";

export type { Variants, Transition, MotionProps } from "framer-motion";
