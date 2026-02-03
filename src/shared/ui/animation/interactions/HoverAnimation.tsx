/**
 * HoverAnimation - 호버 효과 애니메이션
 */
import { ReactNode, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { SPRING } from "../config/easing";

type HoverType = "scale" | "lift" | "glow" | "card";

interface HoverAnimationProps
    extends Omit<HTMLMotionProps<"div">, "whileHover"> {
    children: ReactNode;
    /** 비활성화 */
    disabled?: boolean;
    /** 호버 타입 */
    type?: HoverType;
    /** 커스텀 스케일 값 */
    scale?: number;
}

const HOVER_CONFIGS: Record<HoverType, object> = {
    scale: { scale: 1.02 },
    lift: { scale: 1.02, y: -2 },
    glow: {
        scale: 1.02,
        boxShadow: "0 0 20px rgba(24, 144, 255, 0.3)",
    },
    card: {
        scale: 1.02,
        y: -4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    },
};

export const HoverAnimation = forwardRef<HTMLDivElement, HoverAnimationProps>(
    function HoverAnimation(
        { children, disabled = false, type = "scale", scale, style, ...props },
        ref
    ) {
        if (disabled) {
            return (
                <div
                    ref={ref}
                    style={style}
                    {...(props as React.HTMLAttributes<HTMLDivElement>)}
                >
                    {children}
                </div>
            );
        }

        const hoverConfig = scale ? { scale } : HOVER_CONFIGS[type];

        return (
            <motion.div
                ref={ref}
                whileHover={hoverConfig}
                transition={SPRING.snappy}
                style={style}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
