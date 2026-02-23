/**
 * Timer action column (Toss-style outline/pulse button)
 * 2-5: Timer pulse animation via CSS + framer-motion tap
 */

import { Tooltip } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import { cn } from "../../../../shared/lib/cn";
import { RECORD_TOOLTIP } from "../../constants";
import { motion } from "../../../../shared/ui/animation";

interface TimerActionColumnProps {
    record: WorkRecord;
    is_active: boolean;
    is_timer_running: boolean;
    onToggle: (record: WorkRecord) => void;
}

export function TimerActionColumn({
    record,
    is_active,
    is_timer_running,
    onToggle,
}: TimerActionColumnProps) {
    const tooltip_title = is_active
        ? RECORD_TOOLTIP.STOP_TIMER
        : is_timer_running
        ? RECORD_TOOLTIP.SWITCH_TIMER
        : RECORD_TOOLTIP.START_TIMER;

    return (
        <Tooltip title={tooltip_title}>
            <motion.button
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.1 }}
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-0 bg-transparent cursor-pointer",
                    is_active
                        ? "bg-error text-white shadow-sm timer-pulse"
                        : "text-text-disabled hover:text-primary"
                )}
                style={
                    !is_active
                        ? {
                              border: "2px solid var(--color-border-default)",
                          }
                        : undefined
                }
                onClick={() => onToggle(record)}
            >
                {is_active ? (
                    <PauseCircleOutlined style={{ fontSize: 16 }} />
                ) : (
                    <PlayCircleOutlined style={{ fontSize: 16 }} />
                )}
            </motion.button>
        </Tooltip>
    );
}
