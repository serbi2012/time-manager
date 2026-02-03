/**
 * PressAnimation - 눌림 효과 애니메이션
 * 버튼이나 클릭 가능한 요소에 적용
 */
import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface PressAnimationProps
    extends Omit<HTMLMotionProps<"div">, "whileTap" | "style"> {
    children: ReactNode;
    /** 비활성화 */
    disabled?: boolean;
    /** 스케일 값 (기본: 0.97) */
    scale?: number;
    /** 강한 효과 사용 */
    strong?: boolean;
    /** 스타일 */
    style?: CSSProperties;
}

export const PressAnimation = forwardRef<HTMLDivElement, PressAnimationProps>(
    function PressAnimation(
        { children, disabled = false, scale, strong = false, style, ...props },
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

        const pressScale = scale ?? (strong ? 0.95 : 0.97);

        return (
            <motion.div
                ref={ref}
                whileTap={{ scale: pressScale }}
                transition={{ duration: 0.1 }}
                style={{ ...style, cursor: "pointer" }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
