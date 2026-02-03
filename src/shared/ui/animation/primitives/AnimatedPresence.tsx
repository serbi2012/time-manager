/**
 * AnimatedPresence - 조건부 렌더링 애니메이션
 * 요소가 나타나고 사라질 때 애니메이션 적용
 */
import { ReactNode } from "react";
import {
    AnimatePresence as FramerAnimatePresence,
    motion,
    Variants,
} from "framer-motion";
import {
    FADE,
    SLIDE,
    SCALE,
    FADE_SCALE,
    getPreset,
    PresetType,
} from "../config/presets";

export type AnimationType =
    | "fade"
    | "fadeScale"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scale";

interface AnimatedPresenceProps {
    /** 렌더링할 자식 요소 */
    children: ReactNode;
    /** 표시 여부 */
    show: boolean;
    /** 애니메이션 타입 */
    type?: AnimationType;
    /** 커스텀 지속 시간 (ms) */
    duration?: number;
    /** 시작 지연 시간 (ms) */
    delay?: number;
    /** CSS 클래스명 */
    className?: string;
    /** 스타일 */
    style?: React.CSSProperties;
    /** 애니메이션 완료 콜백 */
    onAnimationComplete?: () => void;
    /** 애니메이션 비활성화 */
    disabled?: boolean;
}

const TYPE_TO_PRESET: Record<AnimationType, PresetType> = {
    fade: "fade",
    fadeScale: "fadeScale",
    slideUp: "slideUp",
    slideDown: "slideDown",
    slideLeft: "slideLeft",
    slideRight: "slideRight",
    scale: "scale",
};

export function AnimatedPresence({
    children,
    show,
    type = "fade",
    duration,
    delay = 0,
    className,
    style,
    onAnimationComplete,
    disabled = false,
}: AnimatedPresenceProps) {
    // 애니메이션 비활성화 시 즉시 렌더링
    if (disabled) {
        return show ? (
            <div className={className} style={style}>
                {children}
            </div>
        ) : null;
    }

    const preset = getPreset(TYPE_TO_PRESET[type]);

    // 커스텀 duration이 있으면 transition 덮어쓰기
    const customTransition = duration
        ? { ...preset.transition, duration: duration / 1000 }
        : preset.transition;

    return (
        <FramerAnimatePresence mode="wait">
            {show && (
                <motion.div
                    initial={preset.initial}
                    animate={preset.animate}
                    exit={preset.exit}
                    transition={{
                        ...customTransition,
                        delay: delay / 1000,
                    }}
                    className={className}
                    style={style}
                    onAnimationComplete={onAnimationComplete}
                >
                    {children}
                </motion.div>
            )}
        </FramerAnimatePresence>
    );
}

// ============================================================================
// 간편 사용 컴포넌트
// ============================================================================

interface SimpleAnimatedProps {
    children: ReactNode;
    show: boolean;
    className?: string;
    style?: React.CSSProperties;
    onAnimationComplete?: () => void;
}

/** 페이드 애니메이션 */
export function FadeIn(props: SimpleAnimatedProps) {
    return <AnimatedPresence {...props} type="fade" />;
}

/** 슬라이드 업 애니메이션 */
export function SlideUp(props: SimpleAnimatedProps) {
    return <AnimatedPresence {...props} type="slideUp" />;
}

/** 스케일 애니메이션 */
export function ScaleIn(props: SimpleAnimatedProps) {
    return <AnimatedPresence {...props} type="scale" />;
}
