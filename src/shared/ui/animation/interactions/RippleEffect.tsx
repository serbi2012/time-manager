/**
 * RippleEffect - 리플(물결) 효과 애니메이션
 * Material Design 스타일의 클릭 피드백
 */
import {
    useState,
    useCallback,
    type ReactNode,
    type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
    id: number;
    x: number;
    y: number;
    size: number;
}

interface RippleEffectProps {
    children: ReactNode;
    /** 리플 색상 (기본: rgba(0, 0, 0, 0.1)) */
    color?: string;
    /** 애니메이션 지속 시간 (ms) */
    duration?: number;
    /** CSS 클래스명 */
    className?: string;
    /** 스타일 */
    style?: CSSProperties;
    /** 비활성화 */
    disabled?: boolean;
    /** 클릭 이벤트 핸들러 */
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function RippleEffect({
    children,
    color = "rgba(0, 0, 0, 0.1)",
    duration = 600,
    className,
    style,
    disabled = false,
    onClick,
}: RippleEffectProps) {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) {
                onClick?.(e);
                return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const newRipple: Ripple = {
                id: Date.now(),
                x,
                y,
                size,
            };

            setRipples((prev) => [...prev, newRipple]);

            // 애니메이션 완료 후 리플 제거
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
            }, duration);

            onClick?.(e);
        },
        [disabled, duration, onClick]
    );

    return (
        <div
            className={className}
            onClick={handleClick}
            style={{
                ...style,
                position: "relative",
                overflow: "hidden",
                cursor: disabled ? undefined : "pointer",
            }}
        >
            {children}
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: duration / 1000,
                            ease: "easeOut",
                        }}
                        style={{
                            position: "absolute",
                            left: ripple.x,
                            top: ripple.y,
                            width: ripple.size,
                            height: ripple.size,
                            borderRadius: "50%",
                            backgroundColor: color,
                            pointerEvents: "none",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// 버튼용 래퍼
// ============================================================================

interface RippleButtonProps extends RippleEffectProps {
    /** 버튼 타입 */
    type?: "primary" | "default" | "text";
}

/**
 * 리플 효과가 있는 버튼 래퍼
 */
export function RippleButton({
    type = "default",
    color,
    children,
    ...props
}: RippleButtonProps) {
    const rippleColor =
        color ??
        (type === "primary"
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(0, 0, 0, 0.1)");

    return (
        <RippleEffect color={rippleColor} {...props}>
            {children}
        </RippleEffect>
    );
}
