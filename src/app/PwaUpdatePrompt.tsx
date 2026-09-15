/**
 * 새 버전 안내
 * 자동으로 새로고침하지 않고, 사용자가 누를 때 적용한다
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReloadOutlined } from "@ant-design/icons";

import { applyPwaUpdate, PWA_NEED_REFRESH_EVENT } from "../shared/lib/pwa";
import { SPRING } from "../shared/ui/animation";
import { PWA_UPDATE_LABELS } from "@/shared/constants";

export function PwaUpdatePrompt() {
    const [is_visible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleNeedRefresh = () => setIsVisible(true);

        window.addEventListener(PWA_NEED_REFRESH_EVENT, handleNeedRefresh);

        return () => {
            window.removeEventListener(
                PWA_NEED_REFRESH_EVENT,
                handleNeedRefresh
            );
        };
    }, []);

    const handleApply = useCallback(() => {
        setIsVisible(false);
        applyPwaUpdate();
    }, []);

    return (
        <AnimatePresence>
            {is_visible && (
                <motion.div
                    className="mobile-undo-toast"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={SPRING.toss}
                >
                    <span className="text-sm text-white">
                        {PWA_UPDATE_LABELS.title}
                    </span>
                    <button
                        type="button"
                        className="shrink-0 inline-flex items-center gap-xs border-0 bg-transparent text-sm font-semibold text-primary cursor-pointer px-sm py-xs"
                        onClick={handleApply}
                    >
                        <ReloadOutlined />
                        {PWA_UPDATE_LABELS.action}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
