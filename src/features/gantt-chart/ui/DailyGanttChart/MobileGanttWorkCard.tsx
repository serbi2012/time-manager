/**
 * Mobile gantt work card
 * - Color indicator bar + deal/work name
 * - Total duration + running dot
 * - Session time chips
 * - Tap to select / edit
 * - Long-press for context menu
 */

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

import { getSessionMinutes } from "../../../../shared/lib/session";
import { formatDuration } from "../../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import type { GroupedWork } from "../../lib/slot_calculator";
import { formatSessionRange } from "../../lib/mobile_segment_calculator";
import { cn } from "../../../../shared/lib/cn";
import { useLongPress } from "../../../../shared/hooks";
import { GANTT_MOBILE_RUNNING_LABEL } from "../../constants";

interface MobileGanttWorkCardProps {
    group: GroupedWork;
    color: string;
    is_active: boolean;
    is_running: boolean;
    onTap: (work_key: string) => void;
    onEdit: (record: WorkRecord, session: WorkSession) => void;
    onLongPress?: (record: WorkRecord, anchor_rect: DOMRect) => void;
}

export function MobileGanttWorkCard({
    group,
    color,
    is_active,
    is_running,
    onTap,
    onEdit,
    onLongPress: on_long_press,
}: MobileGanttWorkCardProps) {
    const card_ref = useRef<HTMLDivElement>(null);

    const total_minutes = group.sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );

    const display_name = group.record.deal_name || group.record.work_name;
    const sub_name = group.record.deal_name ? group.record.work_name : null;

    const handleLongPress = useCallback(() => {
        const rect = card_ref.current?.getBoundingClientRect();
        if (rect && on_long_press) {
            on_long_press(group.record, rect);
        }
    }, [on_long_press, group.record]);

    const { is_pressing, handlers } = useLongPress({
        onLongPress: handleLongPress,
    });

    const DROPLET_SPRING = is_pressing
        ? { type: "spring" as const, stiffness: 400, damping: 25 }
        : { type: "spring" as const, stiffness: 300, damping: 12, mass: 0.7 };

    return (
        <motion.div
            ref={card_ref}
            className={cn(
                "rounded-xl p-3.5 transition-all duration-200 cursor-pointer",
                is_active
                    ? "bg-white shadow-md border border-gray-100 scale-[1.01]"
                    : "bg-white border border-gray-100/60"
            )}
            animate={
                is_pressing
                    ? { scale: 0.97, outline: "3px solid rgba(49,130,246,0.4)", outlineOffset: "1px" }
                    : { scale: 1, outline: "0px solid transparent", outlineOffset: "0px" }
            }
            transition={DROPLET_SPRING}
            onClick={() => onTap(group.key)}
            {...handlers}
        >
            <div className="flex items-start gap-md">
                {/* Color indicator */}
                <div
                    className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-sm">
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                                {display_name}
                            </div>
                            {sub_name && (
                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                    {sub_name}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {is_running && (
                                <div className="w-1.5 h-1.5 rounded-full bg-success mobile-gantt-pulse-dot" />
                            )}
                            <span className="text-sm font-semibold text-gray-800 tabular-nums">
                                {formatDuration(total_minutes)}
                            </span>
                        </div>
                    </div>

                    {/* Session chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {group.sessions.map((session, idx) => {
                            const session_is_running = !session.end_time;
                            return (
                                <button
                                    key={session.id || idx}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-md tabular-nums border-0 cursor-pointer transition-colors"
                                    style={{
                                        background: `${color}15`,
                                        color: color,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(group.record, session);
                                    }}
                                >
                                    {formatSessionRange(
                                        session,
                                        session_is_running,
                                        GANTT_MOBILE_RUNNING_LABEL
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
