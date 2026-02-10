/**
 * More actions dropdown menu (⋯ button)
 * 5-2: FadeScale dropdown animation
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
    EllipsisOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import {
    motion,
    AnimatePresence,
    FADE_SCALE,
    SPRING,
} from "../../../../shared/ui/animation";

import { RECORD_BUTTON } from "../../constants";

interface MoreActionsMenuProps {
    onOpenCompleted: () => void;
    onOpenTrash: () => void;
    onCopyRecords: () => void;
    disabled_copy?: boolean;
}

export function MoreActionsMenu({
    onOpenCompleted,
    onOpenTrash,
    onCopyRecords,
    disabled_copy = false,
}: MoreActionsMenuProps) {
    const [is_open, setIsOpen] = useState(false);
    const menu_ref = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (!is_open) return;

        function handleClickOutside(e: MouseEvent) {
            if (
                menu_ref.current &&
                !menu_ref.current.contains(e.target as Node)
            ) {
                handleClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [is_open, handleClose]);

    return (
        <div className="relative" ref={menu_ref}>
            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(!is_open)}
                className={`h-9 w-9 border-0 bg-transparent rounded-md flex items-center justify-center transition-colors border ${
                    is_open
                        ? "bg-bg-grey border-border-dark"
                        : "hover:bg-bg-grey border-border-default"
                } text-text-secondary cursor-pointer`}
            >
                <EllipsisOutlined style={{ fontSize: 18 }} />
            </motion.button>

            {/* 5-2: Dropdown with fadeScale */}
            <AnimatePresence>
                {is_open && (
                    <motion.div
                        initial={FADE_SCALE.initial}
                        animate={FADE_SCALE.animate}
                        exit={FADE_SCALE.exit}
                        transition={SPRING.snappy}
                        style={{ transformOrigin: "top right" }}
                        className="absolute right-0 top-11 w-44 bg-white rounded-lg shadow-lg border border-border-light py-sm z-50"
                    >
                        <button
                            className="w-full px-lg py-sm border-0 bg-transparent flex items-center gap-md text-sm text-text-primary hover:bg-bg-light transition-colors cursor-pointer"
                            onClick={() => {
                                onOpenCompleted();
                                handleClose();
                            }}
                        >
                            <CheckCircleOutlined
                                style={{
                                    color: "var(--color-success)",
                                    fontSize: 14,
                                }}
                            />
                            {RECORD_BUTTON.VIEW_COMPLETED}
                        </button>
                        <button
                            className="w-full px-lg py-sm border-0 bg-transparent flex items-center gap-md text-sm text-text-primary hover:bg-bg-light transition-colors cursor-pointer"
                            onClick={() => {
                                onOpenTrash();
                                handleClose();
                            }}
                        >
                            <DeleteOutlined
                                style={{
                                    color: "var(--color-error)",
                                    fontSize: 14,
                                }}
                            />
                            {RECORD_BUTTON.VIEW_TRASH}
                        </button>
                        <div className="h-px bg-border-light mx-md my-xs" />
                        <button
                            className="w-full px-lg py-sm border-0 bg-transparent flex items-center gap-md text-sm text-text-primary hover:bg-bg-light transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                                onCopyRecords();
                                handleClose();
                            }}
                            disabled={disabled_copy}
                        >
                            <CopyOutlined
                                style={{
                                    color: "var(--gray-600)",
                                    fontSize: 14,
                                }}
                            />
                            {RECORD_BUTTON.COPY_RECORDS}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
