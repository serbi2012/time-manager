/**
 * Generic floating action menu for mobile long-press interactions.
 * Configurable menu items with spring animations.
 */

import { useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";

import { haptic, type HapticKind } from "@/shared/lib/haptic";
import { calcAnchoredMenuPosition } from "@/shared/lib/mobile/menu_position";
import { SPRING } from "./animation";

export interface MobileActionMenuItem {
    key: string;
    label: string;
    icon: React.ComponentType<AntdIconProps>;
    color: string;
    bg: string;
    haptic?: HapticKind;
}

export interface MobileActionMenuProps {
    open: boolean;
    anchor_rect: DOMRect | null;
    items: MobileActionMenuItem[];
    onAction: (key: string) => void;
    onClose: () => void;
}

const MENU_MARGIN = 8;
const MENU_WIDTH = 140;
const MENU_ITEM_HEIGHT = 52;
const BOTTOM_NAV_RESERVED = 90;

const BACKDROP_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const MENU_VARIANTS = {
    hidden: { opacity: 0, scale: 0.4, y: -6 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            ...SPRING.droplet_pop,
            staggerChildren: 0.05,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.85,
        y: -4,
        transition: {
            type: "spring" as const,
            stiffness: 500,
            damping: 30,
            duration: 0.15,
        },
    },
};

const ITEM_VARIANTS = {
    hidden: { opacity: 0, x: 14, scale: 0.8 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 14,
            mass: 0.5,
        },
    },
    exit: { opacity: 0, x: 8, transition: { duration: 0.1 } },
};

export function MobileActionMenu({
    open,
    anchor_rect,
    items,
    onAction,
    onClose,
}: MobileActionMenuProps) {
    const menu_ref = useRef<HTMLDivElement>(null);

    const position = useMemo(
        () =>
            calcAnchoredMenuPosition({
                anchor: anchor_rect,
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                menu_width: MENU_WIDTH,
                menu_height: items.length * MENU_ITEM_HEIGHT,
                margin: MENU_MARGIN,
                bottom_reserved: BOTTOM_NAV_RESERVED,
            }),
        [anchor_rect, items.length]
    );

    useEffect(() => {
        if (!open) return;
        const dismiss = () => onClose();
        window.addEventListener("scroll", dismiss, {
            capture: true,
            passive: true,
        });
        return () =>
            window.removeEventListener("scroll", dismiss, { capture: true });
    }, [open, onClose]);

    const handleAction = useCallback(
        (item: MobileActionMenuItem) => {
            if (item.haptic) haptic(item.haptic);
            onClose();
            requestAnimationFrame(() => onAction(item.key));
        },
        [onClose, onAction]
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
                        ref={menu_ref}
                        className="fixed z-[1000] min-w-[140px] bg-white rounded-xl overflow-hidden"
                        style={{
                            top: position.top,
                            right: position.right,
                            boxShadow:
                                "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        variants={MENU_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {items.map((item) => (
                            <motion.button
                                key={item.key}
                                className="flex items-center gap-md w-full px-lg py-md border-0 cursor-pointer bg-transparent transition-colors"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                }}
                                variants={ITEM_VARIANTS}
                                whileTap={{
                                    scale: 0.96,
                                    backgroundColor: item.bg,
                                }}
                                onClick={() => handleAction(item)}
                            >
                                <span
                                    className="flex items-center justify-center w-[28px] h-[28px] rounded-lg"
                                    style={{
                                        background: item.bg,
                                        color: item.color,
                                    }}
                                >
                                    <item.icon style={{ fontSize: 14 }} />
                                </span>
                                <span className="text-md font-medium text-gray-800">
                                    {item.label}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
