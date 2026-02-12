/**
 * Single record card — play button + color bar + content + duration
 * Each record is rendered as an independent card (no border-bottom dividers).
 * Completed records show a green check circle, muted colors, and gray color bar.
 * Press animation driven by is_pressing prop from MobileSwipeCard.
 */

import { motion } from "framer-motion";
import { CaretRightFilled, CheckOutlined } from "@ant-design/icons";

import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";
import { getCategoryColor } from "../../../../shared/config";
import { cn } from "../../../../shared/lib/cn";

interface MobileRecordRowProps {
    record: WorkRecord;
    onToggle: () => void;
    /** 외부에서 주입되는 눌림 상태 (물방울 애니메이션용) */
    is_pressing?: boolean;
}

export function MobileRecordRow({
    record,
    onToggle,
    is_pressing = false,
}: MobileRecordRowProps) {
    const display_name = record.deal_name || record.work_name;
    const category = record.category_name || "";
    const color = getCategoryColor(category);
    const is_done = record.is_completed;
    const sessions_text = record.start_time
        ? `${record.start_time} ~ ${record.end_time || "진행 중"}`
        : "";
    const sub_info = [category, sessions_text].filter(Boolean).join(" · ");

    /** 물방울 스프링: 눌림 시 색상 틴트, 놓으면 부드럽게 복귀 (scale은 SwipeCard에서 처리) */
    const DROPLET_SPRING = is_pressing
        ? { type: "spring" as const, stiffness: 400, damping: 25 }
        : { type: "spring" as const, stiffness: 300, damping: 12, mass: 0.7 };

    return (
        <motion.div
            className={cn(
                "flex items-center gap-md p-lg",
                is_done && "bg-gray-50"
            )}
            animate={
                is_pressing
                    ? {
                          boxShadow: `inset 0 0 0 2px ${color}30`,
                          backgroundColor: `${color}08`,
                      }
                    : {
                          boxShadow: "inset 0 0 0 0px transparent",
                          backgroundColor: is_done
                              ? "var(--gray-50)"
                              : "rgba(255,255,255,0)",
                      }
            }
            transition={DROPLET_SPRING}
        >
            {/* Play button / Completed check */}
            {is_done ? (
                <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 bg-success">
                    <CheckOutlined className="text-white text-sm" />
                </div>
            ) : (
                <button
                    className="w-[34px] h-[34px] rounded-lg bg-gray-50 border-0 flex items-center justify-center text-gray-400 cursor-pointer shrink-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                >
                    <CaretRightFilled style={{ fontSize: 13 }} />
                </button>
            )}

            {/* Color bar — muted gray when completed */}
            <div
                className="w-[3px] h-[34px] rounded-full shrink-0"
                style={{ background: is_done ? "var(--gray-300)" : color }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        "text-lg font-medium truncate",
                        is_done ? "text-gray-400" : "text-gray-800"
                    )}
                >
                    {display_name}
                </div>
                {sub_info && (
                    <div
                        className={cn(
                            "text-sm mt-[2px] truncate",
                            is_done ? "text-gray-300" : "text-gray-400"
                        )}
                    >
                        {sub_info}
                    </div>
                )}
            </div>

            {/* Duration */}
            <div
                className={cn(
                    "text-xl font-semibold shrink-0 tabular-nums",
                    is_done ? "text-gray-400" : "text-gray-700"
                )}
            >
                {formatDuration(record.duration_minutes)}
            </div>
        </motion.div>
    );
}
