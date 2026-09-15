import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

import { cn } from "@/shared/lib/cn";
import { SPRING } from "@/shared/ui/animation";
import { useOverlayHistory } from "@/shared/hooks/useOverlayHistory";

/** 이 거리 이상 끌어내리면 닫는다 */
const CLOSE_DRAG_OFFSET = 120;
/** 이 속도 이상으로 튕기면 거리와 무관하게 닫는다 */
const CLOSE_DRAG_VELOCITY = 500;
const DEFAULT_HEIGHT_RATIO = 0.9;

export interface MobileBottomSheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    /** 화면 높이 대비 시트 높이 (0~1) */
    height_ratio?: number;
    /** 하단 고정 영역 (액션 버튼 등) */
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * 모바일 바텀시트
 * 끌어내려 닫기, 뒤로가기로 닫기, 본문 스크롤 잠금을 포함한다
 */
export function MobileBottomSheet({
    open,
    onClose,
    title,
    height_ratio = DEFAULT_HEIGHT_RATIO,
    footer,
    children,
    className,
}: MobileBottomSheetProps) {
    useOverlayHistory({ open, onClose });

    useEffect(() => {
        if (!open) return;

        const previous_overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous_overflow;
        };
    }, [open]);

    const handleDragEnd = (_event: unknown, info: PanInfo) => {
        if (
            info.offset.y > CLOSE_DRAG_OFFSET ||
            info.velocity.y > CLOSE_DRAG_VELOCITY
        ) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="mobile-sheet-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className={cn("mobile-sheet", className)}
                        style={{ height: `${height_ratio * 100}dvh` }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={SPRING.toss}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.4 }}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex justify-center pt-md pb-sm">
                            <span className="mobile-sheet-handle" />
                        </div>

                        {title && (
                            <div className="px-xl pb-md">
                                <span className="text-xl font-semibold text-text-primary">
                                    {title}
                                </span>
                            </div>
                        )}

                        <div className="mobile-sheet-body">{children}</div>

                        {footer && (
                            <div className="px-xl py-lg border-t border-border-light">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
