/**
 * 페이지 트랜지션 상태 Context
 *
 * 레이아웃에서 하위 페이지 컴포넌트로 트랜지션 상태를 전달
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import type { TransitionSpeed } from "./transition_config";

interface PageTransitionContextValue {
    /** 데이터 로딩 완료 여부 - 트랜지션 시작 조건 */
    is_ready: boolean;
    /** 트랜지션 활성화 여부 */
    transition_enabled: boolean;
    /** 트랜지션 속도 */
    transition_speed: TransitionSpeed;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
    is_ready: false,
    transition_enabled: false,
    transition_speed: "normal",
});

interface PageTransitionProviderProps {
    children: ReactNode;
    /** 트랜지션 시작 조건 (예: initial_load_done) */
    is_ready: boolean;
    /** 트랜지션 활성화 여부 */
    transition_enabled?: boolean;
    /** 트랜지션 속도 */
    transition_speed?: TransitionSpeed;
}

/**
 * 페이지 트랜지션 상태 Provider
 *
 * @example
 * // DesktopLayout.tsx
 * <PageTransitionProvider
 *   is_ready={initial_load_done}
 *   transition_enabled={transition_enabled}
 *   transition_speed={transition_speed}
 * >
 *   <Routes>...</Routes>
 * </PageTransitionProvider>
 */
export function PageTransitionProvider({
    children,
    is_ready,
    transition_enabled = true,
    transition_speed = "normal",
}: PageTransitionProviderProps) {
    return (
        <PageTransitionContext.Provider
            value={{ is_ready, transition_enabled, transition_speed }}
        >
            {children}
        </PageTransitionContext.Provider>
    );
}

/**
 * 페이지 트랜지션 상태 사용 훅
 *
 * @example
 * // DesktopDailyPage.tsx
 * const { is_ready, transition_enabled } = usePageTransitionContext();
 *
 * <SlideIn show={is_ready && transition_enabled} direction="left">
 *   <Sidebar />
 * </SlideIn>
 */
export function usePageTransitionContext() {
    return useContext(PageTransitionContext);
}

export default PageTransitionContext;
