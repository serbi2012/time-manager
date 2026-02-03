/**
 * ErrorShake - 에러 흔들림 애니메이션
 */
import { ReactNode, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface ErrorShakeProps {
    children: ReactNode;
    /** 흔들림 트리거 */
    trigger?: boolean;
    /** 흔들림 강도 (px) */
    intensity?: number;
    /** 애니메이션 지속 시간 (ms) */
    duration?: number;
    /** CSS 클래스명 */
    className?: string;
    /** 스타일 */
    style?: React.CSSProperties;
}

export function ErrorShake({
    children,
    trigger = false,
    intensity = 10,
    duration = 400,
    className,
    style,
}: ErrorShakeProps) {
    const controls = useAnimation();

    useEffect(() => {
        if (trigger) {
            controls.start({
                x: [0, -intensity, intensity, -intensity, intensity, 0],
                transition: { duration: duration / 1000 },
            });
        }
    }, [trigger, controls, intensity, duration]);

    return (
        <motion.div animate={controls} className={className} style={style}>
            {children}
        </motion.div>
    );
}

// ============================================================================
// 훅 버전
// ============================================================================

/**
 * 에러 흔들림을 트리거할 수 있는 훅
 */
export function useErrorShake(intensity = 10, duration = 400) {
    const controls = useAnimation();
    const [isShaking, setIsShaking] = useState(false);

    const shake = async () => {
        setIsShaking(true);
        await controls.start({
            x: [0, -intensity, intensity, -intensity, intensity, 0],
            transition: { duration: duration / 1000 },
        });
        setIsShaking(false);
    };

    return { controls, shake, isShaking };
}
