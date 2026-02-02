/**
 * 공유 UI 컴포넌트 모음
 *
 * @example
 * import { TimeInput, DateInput, CategoryTag } from '@/shared/ui';
 */

// 입력 컴포넌트
export { TimeInput, type TimeInputProps } from "./TimeInput";
export { DateInput, type DateInputProps } from "./DateInput";

// 표시 컴포넌트
export { CategoryTag, type CategoryTagProps } from "./CategoryTag";
export { DurationDisplay, type DurationDisplayProps } from "./DurationDisplay";
export { TimerDisplay, type TimerDisplayProps } from "./TimerDisplay";

// 유틸리티 컴포넌트
export { HighlightText } from "./HighlightText";

// 트랜지션 컴포넌트
export {
  SlideIn,
  FadeIn,
  PageTransitionProvider,
  usePageTransitionContext,
  usePageTransition,
  DESKTOP_DAILY_DELAYS,
  MOBILE_DAILY_DELAYS,
  TRANSITION_CONFIG,
  SLIDE_DIRECTIONS,
  PAGE_TRANSITION_DELAYS,
  TRANSITION_SPEED_DURATION,
  TRANSITION_SPEED_STAGGER,
  TRANSITION_SPEED_LABELS,
  type SlideDirection,
  type TransitionSpeed,
} from "./transitions";
