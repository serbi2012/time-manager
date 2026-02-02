/**
 * 방향별 슬라이드 인 트랜지션 컴포넌트
 */

import { type ReactNode, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
    TRANSITION_CONFIG,
    SLIDE_DIRECTIONS,
    TRANSITION_SPEED_DURATION,
    type SlideDirection,
    type TransitionSpeed,
} from "./transition_config";

interface SlideInProps {
    /** 자식 요소 */
    children: ReactNode;
    /** 슬라이드 방향 */
    direction: SlideDirection;
    /** 애니메이션 딜레이 (초) */
    delay?: number;
    /** 트랜지션 표시 여부 */
    show: boolean;
    /** 추가 CSS 클래스 */
    className?: string;
    /** 인라인 스타일 */
    style?: React.CSSProperties;
    /** 트랜지션 활성화 여부 (기본값: true) */
    enabled?: boolean;
    /** 트랜지션 속도 (기본값: normal) */
    speed?: TransitionSpeed;
}

/**
 * 방향별 슬라이드 인 트랜지션 컴포넌트
 *
 * @example
 * <SlideIn direction="left" show={is_ready} delay={0.1}>
 *   <Sidebar />
 * </SlideIn>
 */
export function SlideIn({
    children,
    direction,
    delay = 0,
    show,
    className,
    style,
    enabled = true,
    speed = "normal",
}: SlideInProps) {
    const duration = TRANSITION_SPEED_DURATION[speed];

    const variants: Variants = useMemo(
        () => ({
            hidden: {
                opacity: 0,
                ...SLIDE_DIRECTIONS[direction],
            },
            visible: {
                opacity: 1,
                x: 0,
                y: 0,
                transition: {
                    duration,
                    ease: TRANSITION_CONFIG.ease,
                    delay,
                },
            },
        }),
        [direction, delay, duration]
    );

    // 트랜지션 비활성화 시 즉시 표시
    if (!enabled) {
        return (
            <div className={className} style={style}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate={show ? "visible" : "hidden"}
            variants={variants}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

export default SlideIn;
