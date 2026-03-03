/**
 * 라우트 변경 시 방향 슬라이드 트랜지션
 *
 * 메뉴 위치(좌→우 순서)를 기반으로 이동 방향을 감지하여
 * 콘텐츠를 좌/우에서 슬라이드하며 전환한다.
 */

import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ROUTE_ORDER,
    ROUTE_TRANSITION_OFFSET,
    TRANSITION_EASE,
    TRANSITION_SPEED_DURATION,
} from "./transition_config";
import { usePageTransitionContext } from "./PageTransitionContext";

interface RouteTransitionProps {
    children: ReactNode;
}

/**
 * 라우트 변경 시 방향 슬라이드 트랜지션 컴포넌트
 *
 * PageTransitionProvider 내부에서 사용해야 하며,
 * context의 transition_enabled / transition_speed를 자동으로 참조한다.
 *
 * @example
 * <PageTransitionProvider ...>
 *   <RouteTransition>
 *     <Routes>...</Routes>
 *   </RouteTransition>
 * </PageTransitionProvider>
 */
export function RouteTransition({ children }: RouteTransitionProps) {
    const location = useLocation();
    const { is_ready, transition_enabled, transition_speed } =
        usePageTransitionContext();

    const [prev_pathname, set_prev_pathname] = useState(location.pathname);
    const [direction, set_direction] = useState(1);

    if (location.pathname !== prev_pathname) {
        const prev_index = ROUTE_ORDER[prev_pathname] ?? 0;
        const current_index = ROUTE_ORDER[location.pathname] ?? 0;
        set_direction(current_index > prev_index ? 1 : -1);
        set_prev_pathname(location.pathname);
    }

    if (!transition_enabled) {
        return <>{children}</>;
    }

    const duration = TRANSITION_SPEED_DURATION[transition_speed];

    return (
        <motion.div
            key={location.pathname}
            initial={
                is_ready
                    ? {
                          x: direction * ROUTE_TRANSITION_OFFSET,
                          opacity: 0,
                      }
                    : false
            }
            animate={{ x: 0, opacity: 1 }}
            transition={{
                duration,
                ease: TRANSITION_EASE,
            }}
        >
            {children}
        </motion.div>
    );
}
