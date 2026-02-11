/**
 * Mobile record item — single record row in B4 card list
 * Animations: stagger entrance (A), press feedback (B), timer-tick (D), count-up (G)
 * Layout: [TimerButton] [Title + Subtitle + TimeRange] [Duration + Category]
 */

import { useState, useEffect, useRef } from "react";
import { Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

import type { WorkRecord } from "../../../../shared/types";
import { formatTimer } from "../../../../shared/lib/time";
import { getCategoryColor } from "../../../../shared/config";
import { cn } from "../../../../shared/lib/cn";
import { MOBILE_RECORD_LABEL, RECORD_UI_TEXT } from "../../constants";

import { MobileTimerButton } from "./MobileTimerButton";

interface MobileRecordItemProps {
    record: WorkRecord;
    is_active: boolean;
    elapsed_seconds: number;
    onToggle: () => void;
    /** Stagger index for entrance animation */
    stagger_index?: number;
    /** Key that changes to re-trigger entrance animation */
    animation_key?: string;
}

/** Count-up animation: 0 → target over ~400ms */
function useCountUp(target: number, animation_key?: string): number {
    const [value, setValue] = useState(target);
    const frame_ref = useRef<number>(0);

    useEffect(() => {
        if (!animation_key) {
            setValue(target);
            return;
        }

        let frame = 0;
        const total_frames = 20;
        setValue(0);

        const animate = () => {
            frame++;
            const progress = Math.min(frame / total_frames, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (frame < total_frames) {
                frame_ref.current = requestAnimationFrame(animate);
            }
        };
        frame_ref.current = requestAnimationFrame(animate);

        return () => {
            if (frame_ref.current) cancelAnimationFrame(frame_ref.current);
        };
    }, [target, animation_key]);

    return value;
}

export function MobileRecordItem({
    record,
    is_active,
    elapsed_seconds,
    onToggle,
    stagger_index = 0,
    animation_key,
}: MobileRecordItemProps) {
    const display_name = record.deal_name || record.work_name;
    const sub_name = record.deal_name ? record.work_name : null;
    const time_range_end = record.end_time || MOBILE_RECORD_LABEL.IN_PROGRESS;
    const is_completed = record.is_completed;

    const count_value = useCountUp(record.duration_minutes, animation_key);

    return (
        <div
            className={cn(
                "flex items-center gap-md py-md px-lg mobile-record-pressable mobile-record-fade-up",
                is_completed && "opacity-60"
            )}
            style={{ animationDelay: `${stagger_index * 0.07}s` }}
        >
            {/* Timer button or completed icon */}
            {is_completed ? (
                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-success/10">
                    <CheckCircleOutlined
                        style={{ fontSize: 18, color: "var(--color-success)" }}
                    />
                </div>
            ) : (
                <MobileTimerButton
                    is_active={is_active}
                    size={is_active ? 40 : 36}
                    onToggle={onToggle}
                />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm">
                    <span
                        className={cn(
                            "text-md font-medium truncate",
                            is_completed && "text-text-disabled line-through",
                            is_active && !is_completed && "text-error",
                            !is_active && !is_completed && "text-text-primary"
                        )}
                    >
                        {display_name}
                    </span>
                    {is_active && !is_completed && (
                        <span className="flex-shrink-0 text-xs font-semibold px-sm py-[2px] rounded-sm bg-error-light text-error mobile-timer-tick">
                            {formatTimer(elapsed_seconds)}
                        </span>
                    )}
                </div>
                {sub_name && (
                    <span
                        className={cn(
                            "text-sm mt-[1px] block truncate",
                            is_completed
                                ? "text-text-disabled line-through"
                                : "text-text-secondary"
                        )}
                    >
                        {sub_name}
                    </span>
                )}
                <span className="text-xs text-text-disabled mt-[2px] block">
                    {record.start_time}
                    {RECORD_UI_TEXT.TIME_SEPARATOR}
                    {time_range_end}
                </span>
            </div>

            {/* Right: Duration + Category */}
            <div className="flex-shrink-0 flex flex-col items-end">
                <span
                    className={cn(
                        "text-md font-semibold mobile-count-pop",
                        is_completed && "text-text-disabled",
                        is_active && !is_completed && "text-error",
                        !is_active && !is_completed && "text-text-primary"
                    )}
                    style={{
                        fontVariantNumeric: "tabular-nums",
                        animationDelay: `${stagger_index * 0.08}s`,
                    }}
                    key={`${animation_key}-${record.id}`}
                >
                    {count_value}분
                </span>
                <Tag
                    color={getCategoryColor(record.category_name)}
                    className="!mt-[2px] !text-xs !mr-0"
                >
                    {record.category_name}
                </Tag>
            </div>
        </div>
    );
}
