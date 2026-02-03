/**
 * 전체 화면 로딩 오버레이 컴포넌트
 *
 * MobileLayout, DesktopLayout에서 중복되던 로딩 오버레이를 통합
 * AnimatePresence를 사용하여 부드러운 전환 애니메이션 제공
 *
 * @example
 * <LoadingOverlay
 *   loading={isLoading}
 *   message="데이터를 불러오는 중..."
 * />
 */

import { Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimationConfig } from "../animation/hooks/useAnimationConfig";

export interface LoadingOverlayProps {
    /** 로딩 상태 */
    loading: boolean;
    /** 로딩 메시지 */
    message?: string;
    /** 배경색 (기본값: "#fff") */
    backgroundColor?: string;
    /** z-index (기본값: 1000) */
    zIndex?: number;
    /** Spin 크기 (기본값: "large") */
    spinSize?: "small" | "default" | "large";
    /** 상단 오프셋 (예: 헤더 높이만큼) */
    topOffset?: number;
}

/**
 * 전체 화면 로딩 오버레이
 */
export function LoadingOverlay({
    loading,
    message = "로딩 중...",
    backgroundColor = "#fff",
    zIndex = 1000,
    spinSize = "large",
    topOffset = 0,
}: LoadingOverlayProps) {
    const { enabled } = useAnimationConfig();

    // 애니메이션 비활성화 시 단순 조건부 렌더링
    if (!enabled) {
        if (!loading) return null;

        return (
            <div
                style={{
                    position: "fixed",
                    top: topOffset,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 16,
                    background: backgroundColor,
                    zIndex,
                }}
            >
                <Spin size={spinSize} />
                {message && <span style={{ color: "#666" }}>{message}</span>}
            </div>
        );
    }

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: "fixed",
                        top: topOffset,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        gap: 16,
                        background: backgroundColor,
                        zIndex,
                    }}
                >
                    <Spin size={spinSize} />
                    {message && (
                        <span style={{ color: "#666" }}>{message}</span>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LoadingOverlay;
