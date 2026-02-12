/**
 * Mobile running section — dark gradient timer card
 * Redesigned to match Toss-inspired dark card mockup
 * Long-press triggers a floating context menu for edit/complete/delete.
 */

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";

import type { WorkRecord } from "../../../../shared/types";
import { formatTimer } from "../../../../shared/lib/time";
import { MOBILE_RECORD_LABEL } from "../../constants";
import { useLongPress } from "../../hooks/useLongPress";
import { MobileContextMenu } from "./MobileContextMenu";

interface MobileRunningSectionProps {
    records: WorkRecord[];
    active_record_id: string | null;
    elapsed_seconds: number;
    onToggle: (record: WorkRecord) => void;
    onEdit?: (record: WorkRecord) => void;
    onComplete?: (record: WorkRecord) => void;
    onDelete?: (record: WorkRecord) => void;
    animation_key?: string;
}

const DARK_CARD_GRADIENT: React.CSSProperties = {
    background: "linear-gradient(135deg, #191F28 0%, #333D4B 100%)",
};

const STOP_ICON_STYLE: React.CSSProperties = {
    display: "inline-block",
    width: 14,
    height: 14,
    borderRadius: 3,
    background: "white",
};

export function MobileRunningSection({
    records,
    elapsed_seconds,
    onToggle,
    onEdit,
    onComplete,
    onDelete,
}: MobileRunningSectionProps) {
    const card_ref = useRef<HTMLDivElement>(null);
    const [menu_open, setMenuOpen] = useState(false);
    const [menu_anchor, setMenuAnchor] = useState<DOMRect | null>(null);

    const record = records[0];

    const handleLongPress = useCallback(() => {
        setMenuAnchor(card_ref.current?.getBoundingClientRect() ?? null);
        setMenuOpen(true);
    }, []);

    const { is_pressing, handlers } = useLongPress({
        onLongPress: handleLongPress,
    });

    const handleCloseMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    if (records.length === 0) return null;

    const display_name = record.deal_name || record.work_name;
    const category = record.category_name || "";
    const start_time = record.start_time || "";
    const sub_info = [category, start_time ? `${start_time} ~` : ""]
        .filter(Boolean)
        .join(" · ");

    /** 물방울 스프링: 눌림 시 부드럽게, 놓으면 통통 튀며 복귀 */
    const DROPLET_SPRING = is_pressing
        ? { type: "spring" as const, stiffness: 400, damping: 25 }
        : { type: "spring" as const, stiffness: 300, damping: 12, mass: 0.7 };

    return (
        <>
            <div className="px-xl pt-xl pb-md">
                <motion.div
                    ref={card_ref}
                    className="rounded-2xl overflow-hidden relative"
                    style={DARK_CARD_GRADIENT}
                    animate={
                        is_pressing
                            ? {
                                  scale: 0.97,
                                  outline: "3px solid rgba(49,130,246,0.5)",
                                  outlineOffset: "2px",
                              }
                            : {
                                  scale: 1,
                                  outline: "0px solid transparent",
                                  outlineOffset: "0px",
                              }
                    }
                    transition={DROPLET_SPRING}
                    {...handlers}
                >
                    <div className="p-xl">
                        {/* Running indicator */}
                        <div className="flex items-center gap-sm mb-md">
                            <div className="w-[7px] h-[7px] rounded-full bg-success animate-pulse" />
                            <span className="text-sm font-medium text-success">
                                {MOBILE_RECORD_LABEL.RUNNING_TIMER_LABEL}
                            </span>
                        </div>

                        {/* Content row */}
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1 mr-md">
                                <div className="text-lg font-semibold text-white truncate">
                                    {display_name}
                                </div>
                                {sub_info && (
                                    <div className="text-sm text-gray-400 mt-xs truncate">
                                        {sub_info}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-lg shrink-0">
                                <span className="text-h1 font-bold text-white tabular-nums">
                                    {formatTimer(elapsed_seconds)}
                                </span>
                                <button
                                    className="w-[48px] h-[48px] rounded-full bg-error/90 border-0 flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle(record);
                                    }}
                                >
                                    <span style={STOP_ICON_STYLE} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Floating context menu */}
            <MobileContextMenu
                open={menu_open}
                anchor_rect={menu_anchor}
                onEdit={() => onEdit?.(record)}
                onComplete={() => onComplete?.(record)}
                onDelete={() => onDelete?.(record)}
                onClose={handleCloseMenu}
            />
        </>
    );
}
