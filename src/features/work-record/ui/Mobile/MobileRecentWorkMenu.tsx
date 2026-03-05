/**
 * Mobile recent work popup — shows last N unique works for quick timer start.
 * Triggered by long-press on the FAB.
 */

import { useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircleOutlined } from "@ant-design/icons";

import { triggerHaptic } from "@/shared/lib/haptic";
import { MOBILE_FAB_RECENT_TITLE } from "../../constants";

interface RecentWork {
    record_id: string;
    work_name: string;
    deal_name?: string;
}

interface MobileRecentWorkMenuProps {
    open: boolean;
    anchor_rect: DOMRect | null;
    recent_works: RecentWork[];
    onSelect: (record_id: string) => void;
    onClose: () => void;
}

const MAX_RECENT_ITEMS = 5;

const BACKDROP_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const MENU_SPRING = {
    type: "spring" as const,
    stiffness: 450,
    damping: 15,
    mass: 0.5,
};

const MENU_VARIANTS = {
    hidden: { opacity: 0, scale: 0.4, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { ...MENU_SPRING, staggerChildren: 0.04 },
    },
    exit: {
        opacity: 0,
        scale: 0.85,
        y: 6,
        transition: { type: "spring" as const, stiffness: 500, damping: 30, duration: 0.15 },
    },
};

const ITEM_VARIANTS = {
    hidden: { opacity: 0, x: 14, scale: 0.8 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 400, damping: 14, mass: 0.5 },
    },
    exit: { opacity: 0, x: 8, transition: { duration: 0.1 } },
};

export function MobileRecentWorkMenu({
    open,
    anchor_rect,
    recent_works,
    onSelect,
    onClose,
}: MobileRecentWorkMenuProps) {
    const visible_works = useMemo(
        () => recent_works.slice(0, MAX_RECENT_ITEMS),
        [recent_works]
    );

    const position = useMemo(() => {
        if (!anchor_rect) return { bottom: 160, right: 24 };
        return {
            bottom: window.innerHeight - anchor_rect.top + 8,
            right: window.innerWidth - anchor_rect.right + 8,
        };
    }, [anchor_rect]);

    useEffect(() => {
        if (!open) return;
        const dismiss = () => onClose();
        window.addEventListener("scroll", dismiss, { capture: true, passive: true });
        return () => window.removeEventListener("scroll", dismiss, { capture: true });
    }, [open, onClose]);

    const handleSelect = useCallback(
        (record_id: string) => {
            triggerHaptic(10);
            onClose();
            requestAnimationFrame(() => onSelect(record_id));
        },
        [onClose, onSelect]
    );

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[1000]"
                        variants={BACKDROP_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed z-[1000] min-w-[180px] max-w-[260px] bg-white rounded-xl overflow-hidden"
                        style={{
                            bottom: position.bottom,
                            right: position.right,
                            boxShadow:
                                "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        variants={MENU_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="px-lg pt-md pb-xs">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {MOBILE_FAB_RECENT_TITLE}
                            </span>
                        </div>

                        {visible_works.length === 0 ? (
                            <div className="px-lg py-md text-sm text-gray-400">
                                최근 작업이 없어요
                            </div>
                        ) : (
                            visible_works.map((work) => (
                                <motion.button
                                    key={work.record_id}
                                    className="flex items-center gap-md w-full px-lg py-[10px] border-0 cursor-pointer bg-transparent transition-colors"
                                    style={{ WebkitTapHighlightColor: "transparent" }}
                                    variants={ITEM_VARIANTS}
                                    whileTap={{ scale: 0.96, backgroundColor: "rgba(52,199,89,0.08)" }}
                                    onClick={() => handleSelect(work.record_id)}
                                >
                                    <span className="flex items-center justify-center w-[28px] h-[28px] rounded-lg bg-success/10 text-success flex-shrink-0">
                                        <PlayCircleOutlined style={{ fontSize: 14 }} />
                                    </span>
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="text-sm font-medium text-gray-800 truncate">
                                            {work.deal_name || work.work_name}
                                        </div>
                                        {work.deal_name && (
                                            <div className="text-xs text-gray-400 truncate">
                                                {work.work_name}
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
