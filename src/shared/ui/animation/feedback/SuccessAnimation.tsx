/**
 * SuccessAnimation - 성공 체크마크 애니메이션
 */
import { motion, AnimatePresence } from "framer-motion";
import { CheckOutlined } from "@ant-design/icons";
import { SPRING } from "../config/easing";

interface SuccessAnimationProps {
    /** 표시 여부 */
    show: boolean;
    /** 크기 (px) */
    size?: number;
    /** 배경 색상 */
    color?: string;
    /** 아이콘 색상 */
    iconColor?: string;
    /** 애니메이션 완료 콜백 */
    onComplete?: () => void;
}

export function SuccessAnimation({
    show,
    size = 48,
    color = "#52c41a",
    iconColor = "white",
    onComplete,
}: SuccessAnimationProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={SPRING.bouncy}
                    onAnimationComplete={onComplete}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: color,
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, ...SPRING.snappy }}
                    >
                        <CheckOutlined
                            style={{ fontSize: size * 0.5, color: iconColor }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// 인라인 성공 애니메이션
// ============================================================================

interface InlineSuccessProps {
    show: boolean;
    size?: number;
    color?: string;
}

/**
 * 인라인 체크 애니메이션 (원 없이 체크만)
 */
export function InlineSuccess({
    show,
    size = 16,
    color = "#52c41a",
}: InlineSuccessProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={SPRING.snappy}
                    style={{ display: "inline-flex" }}
                >
                    <CheckOutlined style={{ fontSize: size, color }} />
                </motion.span>
            )}
        </AnimatePresence>
    );
}
