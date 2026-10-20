/**
 * 공유 UI 컴포넌트 모음
 *
 * @example
 * import { TimeInput, DateInput, CategoryTag } from '@/shared/ui';
 * import { BaseModal, HighlightText } from '@/shared/ui';
 */

// 입력 컴포넌트
export { TimeInput, type TimeInputProps } from "./TimeInput";
export { DateInput, type DateInputProps } from "./DateInput";

// 표시 컴포넌트
export { CategoryTag, type CategoryTagProps } from "./CategoryTag";

// 유틸리티 컴포넌트
export { HighlightText } from "./HighlightText";

// 트랜지션 컴포넌트
export {
    SlideIn,
    FadeIn,
    RouteTransition,
    PageTransitionProvider,
    usePageTransitionContext,
    usePageTransition,
    DESKTOP_DAILY_DELAYS,
    MOBILE_DAILY_DELAYS,
    DESKTOP_WEEKLY_STAGGER,
    TRANSITION_CONFIG,
    SLIDE_DIRECTIONS,
    PAGE_TRANSITION_DELAYS,
    TRANSITION_SPEED_DURATION,
    TRANSITION_SPEED_STAGGER,
    TRANSITION_SPEED_LABELS,
    ROUTE_ORDER,
    TRANSITION_EASE,
    ROUTE_TRANSITION_OFFSET,
    CONTENT_SLIDE_UP_OFFSET,
    type SlideDirection,
    type TransitionSpeed,
} from "./transitions";

// 모달 컴포넌트
export { BaseModal, type BaseModalProps } from "./modal";

// 모바일 액션 메뉴
export {
    MobileActionMenu,
    type MobileActionMenuItem,
    type MobileActionMenuProps,
} from "./MobileActionMenu";

// 레이아웃 컴포넌트
export {
    EmptyState,
    type EmptyStateProps,
    type EmptyImageType,
    SidebarToggleButton,
} from "./layout";

// 에러 경계
export { AppErrorBoundary, AppErrorFallback } from "./error";

// 모바일 공용 컴포넌트
export {
    MobileBottomSheet,
    MobileIconButton,
    MobilePageHeader,
    MobilePullIndicator,
    MobileListSkeleton,
    type MobileBottomSheetProps,
    type MobileIconButtonProps,
    type MobilePageHeaderProps,
} from "./mobile";

// 키보드 입력 환경
export {
    InputCapabilityProvider,
    useInputCapability,
    ShortcutKeyBadge,
    DEFAULT_INPUT_CAPABILITY,
    type InputCapability,
    type ShortcutKeyBadgeProps,
} from "./keyboard";

// 확인 팝오버
export { ConfirmPopconfirm, type ConfirmPopconfirmProps } from "./confirm";
