/**
 * LoadingSpinner - 로딩 스피너 애니메이션
 */
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface LoadingSpinnerProps {
    /** 크기 (px) */
    size?: number;
    /** 색상 */
    color?: string;
    /** 두께 (px) */
    thickness?: number;
    /** CSS 클래스명 */
    className?: string;
    /** 스타일 */
    style?: CSSProperties;
}

export function LoadingSpinner({
    size = 24,
    color = "#1890ff",
    thickness = 2,
    className,
    style,
}: LoadingSpinnerProps) {
    return (
        <motion.div
            className={className}
            style={{
                width: size,
                height: size,
                border: `${thickness}px solid #f0f0f0`,
                borderTop: `${thickness}px solid ${color}`,
                borderRadius: "50%",
                ...style,
            }}
            animate={{ rotate: 360 }}
            transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
}

// ============================================================================
// 도트 로딩
// ============================================================================

interface LoadingDotsProps {
    /** 도트 크기 (px) */
    size?: number;
    /** 색상 */
    color?: string;
    /** 도트 간격 (px) */
    gap?: number;
    className?: string;
    style?: CSSProperties;
}

/**
 * 점 3개가 순차적으로 튀어오르는 로딩
 */
export function LoadingDots({
    size = 8,
    color = "#1890ff",
    gap = 4,
    className,
    style,
}: LoadingDotsProps) {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                gap,
                ...style,
            }}
        >
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: color,
                    }}
                    animate={{
                        y: [0, -size, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ============================================================================
// 펄스 로딩
// ============================================================================

interface LoadingPulseProps {
    /** 크기 (px) */
    size?: number;
    /** 색상 */
    color?: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * 펄스 효과 로딩
 */
export function LoadingPulse({
    size = 24,
    color = "#1890ff",
    className,
    style,
}: LoadingPulseProps) {
    return (
        <div
            className={className}
            style={{
                position: "relative",
                width: size,
                height: size,
                ...style,
            }}
        >
            <motion.div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: color,
                }}
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1],
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: color,
                }}
            />
        </div>
    );
}
