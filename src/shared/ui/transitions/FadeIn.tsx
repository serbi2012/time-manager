/**
 * 페이드 인 트랜지션 컴포넌트
 */

import { type ReactNode, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
    TRANSITION_CONFIG,
    TRANSITION_SPEED_DURATION,
    type TransitionSpeed,
} from "./transition_config";

interface FadeInProps {
    /** 자식 요소 */
    children: ReactNode;
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
 * 페이드 인 트랜지션 컴포넌트
 *
 * @example
 * <FadeIn show={is_ready} delay={0.2}>
 *   <Content />
 * </FadeIn>
 */
export function FadeIn({
    children,
    delay = 0,
    show,
    className,
    style,
    enabled = true,
    speed = "normal",
}: FadeInProps) {
    const duration = TRANSITION_SPEED_DURATION[speed];

    const variants: Variants = useMemo(
        () => ({
            hidden: {
                opacity: 0,
            },
            visible: {
                opacity: 1,
                transition: {
                    duration,
                    ease: TRANSITION_CONFIG.ease,
                    delay,
                },
            },
        }),
        [delay, duration]
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

export default FadeIn;
