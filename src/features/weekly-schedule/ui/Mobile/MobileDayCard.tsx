/**
 * Mobile wrapper for DayCard with long-press support.
 * Long-press triggers a context menu for copying or navigating to daily page.
 */

import { useRef, useCallback } from "react";

import { useLongPress } from "@/shared/hooks";
import type { DayGroup } from "../../lib/week_grouper";
import { DayCard, type DayCardProps } from "../WeeklySchedule/DayCard";

interface MobileDayCardProps extends DayCardProps {
    onLongPress?: (day_group: DayGroup, anchor_rect: DOMRect) => void;
}

export function MobileDayCard({
    day_group,
    on_status_change,
    onLongPress: on_long_press,
}: MobileDayCardProps) {
    const wrapper_ref = useRef<HTMLDivElement>(null);

    const handleLongPress = useCallback(() => {
        const rect = wrapper_ref.current?.getBoundingClientRect();
        if (rect && on_long_press) {
            on_long_press(day_group, rect);
        }
    }, [day_group, on_long_press]);

    const { is_pressing, handlers } = useLongPress({
        onLongPress: handleLongPress,
    });

    return (
        <div
            ref={wrapper_ref}
            style={{
                transform: is_pressing ? "scale(0.98)" : "scale(1)",
                transition: "transform 0.15s ease",
            }}
            {...handlers}
        >
            <DayCard
                day_group={day_group}
                on_status_change={on_status_change}
            />
        </div>
    );
}
