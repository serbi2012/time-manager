/**
 * Floating context menu — appears on long-press with lively spring animations.
 * Uses framer-motion for entrance/exit and stagger effects.
 */

import { useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    EditOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

import { MOBILE_CONTEXT_MENU_LABEL } from "../../constants";

interface MobileContextMenuProps {
    /** 메뉴 열림 여부 */
    open: boolean;
    /** 기준이 되는 요소의 DOMRect (위치 계산용) */
    anchor_rect: DOMRect | null;
    /** 수정 클릭 */
    onEdit: () => void;
    /** 완료 클릭 */
    onComplete: () => void;
    /** 삭제 클릭 */
    onDelete: () => void;
    /** 닫기 */
    onClose: () => void;
}

interface MenuPosition {
    top: number;
    right: number;
}

const MENU_MARGIN = 8;

function calcPosition(anchor_rect: DOMRect | null): MenuPosition {
    if (!anchor_rect) return { top: 0, right: 24 };

    const top = anchor_rect.bottom + MENU_MARGIN;
    const right = window.innerWidth - anchor_rect.right + 16;

    return { top, right };
}

const BACKDROP_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

/** 물방울 스프링 — 오버슈트가 큰 탄력 팝 */
const DROPLET_MENU_SPRING = {
    type: "spring" as const,
    stiffness: 450,
    damping: 15,
    mass: 0.5,
};

const MENU_VARIANTS = {
    hidden: { opacity: 0, scale: 0.4, y: -6 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            ...DROPLET_MENU_SPRING,
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

const MENU_ACTIONS = [
    {
        key: "edit",
        label: MOBILE_CONTEXT_MENU_LABEL.EDIT,
        icon: EditOutlined,
        color: "var(--color-primary)",
        bg: "rgba(49,130,246,0.08)",
    },
    {
        key: "complete",
        label: MOBILE_CONTEXT_MENU_LABEL.COMPLETE,
        icon: CheckCircleOutlined,
        color: "var(--color-success)",
        bg: "rgba(52,199,89,0.08)",
    },
    {
        key: "delete",
        label: MOBILE_CONTEXT_MENU_LABEL.DELETE,
        icon: DeleteOutlined,
        color: "var(--color-error)",
        bg: "rgba(240,68,82,0.08)",
    },
] as const;

export function MobileContextMenu({
    open,
    anchor_rect,
    onEdit,
    onComplete,
    onDelete,
    onClose,
}: MobileContextMenuProps) {
    const menu_ref = useRef<HTMLDivElement>(null);

    const position = useMemo(() => calcPosition(anchor_rect), [anchor_rect]);

    const handleAction = useCallback(
        (action: () => void) => {
            onClose();
            // 메뉴 닫힌 후 액션 실행 (exit 애니메이션 허용)
            requestAnimationFrame(() => action());
        },
        [onClose]
    );

    const action_handlers: Record<string, () => void> = {
        edit: onEdit,
        complete: onComplete,
        delete: onDelete,
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50"
                        variants={BACKDROP_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                    />

                    {/* Menu */}
                    <motion.div
                        ref={menu_ref}
                        className="fixed z-50 min-w-[140px] bg-white rounded-xl overflow-hidden"
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
                        {MENU_ACTIONS.map((action) => (
                            <motion.button
                                key={action.key}
                                className="flex items-center gap-md w-full px-lg py-md border-0 cursor-pointer bg-transparent transition-colors"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                }}
                                variants={ITEM_VARIANTS}
                                whileTap={{
                                    scale: 0.96,
                                    backgroundColor: action.bg,
                                }}
                                onClick={() =>
                                    handleAction(action_handlers[action.key])
                                }
                            >
                                <span
                                    className="flex items-center justify-center w-[28px] h-[28px] rounded-lg"
                                    style={{
                                        background: action.bg,
                                        color: action.color,
                                    }}
                                >
                                    <action.icon style={{ fontSize: 14 }} />
                                </span>
                                <span className="text-md font-medium text-gray-800">
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
