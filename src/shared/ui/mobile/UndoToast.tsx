import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SPRING } from "@/shared/ui/animation";
import { UNDO_LABELS } from "@/shared/constants";

/** 자동으로 사라지기까지의 시간 */
const AUTO_DISMISS_MS = 5000;

export interface UndoToastProps {
    open: boolean;
    message: string;
    onUndo: () => void;
    onClose: () => void;
    /** 자동 닫힘 시간 (ms) */
    duration_ms?: number;
}

/**
 * 되돌리기 토스트
 * 삭제·완료처럼 되돌릴 수 있는 동작 뒤에 띄운다
 */
export function UndoToast({
    open,
    message,
    onUndo,
    onClose,
    duration_ms = AUTO_DISMISS_MS,
}: UndoToastProps) {
    useEffect(() => {
        if (!open) return;

        const timer = window.setTimeout(onClose, duration_ms);

        return () => window.clearTimeout(timer);
    }, [open, duration_ms, onClose]);

    const handleUndo = () => {
        onUndo();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="mobile-undo-toast"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={SPRING.toss}
                >
                    <span className="text-sm text-white truncate">
                        {message}
                    </span>
                    <button
                        type="button"
                        className="shrink-0 border-0 bg-transparent text-sm font-semibold text-primary cursor-pointer px-sm py-xs"
                        onClick={handleUndo}
                    >
                        {UNDO_LABELS.undo}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
