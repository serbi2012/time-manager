import { useState, useEffect, useMemo } from "react";

/**
 * 브레이크포인트 정의
 */
export const BREAKPOINTS = {
    mobile: 480,
    tablet: 1023,
    desktop: 1024,
} as const;

/**
 * 반응형 상태 인터페이스
 */
export interface ResponsiveState {
    is_mobile: boolean;
    is_tablet: boolean;
    is_desktop: boolean;
    width: number;
}

/**
 * 반응형 상태를 관리하는 훅
 * 화면 크기에 따라 is_mobile, is_tablet, is_desktop 상태 제공
 * 
 * @example
 * const { is_mobile, is_desktop } = useResponsive();
 */
export function useResponsive(): ResponsiveState {
    const [width, setWidth] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth;
        }
        return 1024; // SSR 기본값
    });

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        // 초기 값 설정
        handleResize();

        // 리사이즈 이벤트 리스너 (throttle 적용)
        let timeout_id: ReturnType<typeof setTimeout> | null = null;
        const throttledResize = () => {
            if (timeout_id) return;
            timeout_id = setTimeout(() => {
                handleResize();
                timeout_id = null;
            }, 100);
        };

        window.addEventListener("resize", throttledResize);

        return () => {
            window.removeEventListener("resize", throttledResize);
            if (timeout_id) clearTimeout(timeout_id);
        };
    }, []);

    const responsive_state = useMemo(
        () => ({
            is_mobile: width <= BREAKPOINTS.mobile,
            is_tablet: width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet,
            is_desktop: width > BREAKPOINTS.tablet,
            width,
        }),
        [width]
    );

    return responsive_state;
}

/**
 * CSS 미디어 쿼리 문자열 생성 헬퍼
 */
export const mediaQuery = {
    mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
    tablet: `@media (min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`,
    desktop: `@media (min-width: ${BREAKPOINTS.desktop}px)`,
    mobileAndTablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
} as const;

export default useResponsive;
