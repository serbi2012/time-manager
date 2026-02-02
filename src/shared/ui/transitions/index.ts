/**
 * 트랜지션 시스템 Public API
 */

// 컴포넌트
export { SlideIn } from "./SlideIn";
export { FadeIn } from "./FadeIn";

// Context
export {
    PageTransitionProvider,
    usePageTransitionContext,
} from "./PageTransitionContext";

// 훅
export {
    usePageTransition,
    DESKTOP_DAILY_DELAYS,
    MOBILE_DAILY_DELAYS,
} from "./usePageTransition";

// 설정
export {
  TRANSITION_CONFIG,
  SLIDE_DIRECTIONS,
  PAGE_TRANSITION_DELAYS,
  TRANSITION_SPEED_DURATION,
  TRANSITION_SPEED_STAGGER,
  TRANSITION_SPEED_LABELS,
  type SlideDirection,
  type TransitionSpeed,
} from "./transition_config";
