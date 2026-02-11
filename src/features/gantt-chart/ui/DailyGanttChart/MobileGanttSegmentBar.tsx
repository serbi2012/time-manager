/**
 * Mobile gantt segment bar
 * - Horizontal timeline bar showing all sessions as colored segments
 * - Lunch zone overlay (striped pattern)
 * - Current time indicator (red line + dot)
 * - Tap segment to highlight corresponding work card
 */

import type { WorkRecord } from "../../../../shared/types";
import type { GroupedWork } from "../../lib/slot_calculator";
import type { TimeRange } from "../../lib/bar_calculator";
import { calculateLunchOverlayStyle } from "../../lib/bar_calculator";
import {
    buildSegments,
    buildHourLabels,
} from "../../lib/mobile_segment_calculator";

interface MobileGanttSegmentBarProps {
    grouped_works: GroupedWork[];
    time_range: TimeRange;
    current_time_mins: number;
    lunch_time: { start: number; end: number };
    active_work_id: string | null;
    getWorkColor: (record: WorkRecord) => string;
    onSegmentTap: (work_id: string) => void;
}

export function MobileGanttSegmentBar({
    grouped_works,
    time_range,
    current_time_mins,
    lunch_time,
    active_work_id,
    getWorkColor,
    onSegmentTap,
}: MobileGanttSegmentBarProps) {
    const total_range = time_range.end - time_range.start;
    const hour_labels = buildHourLabels(time_range);
    const segments = buildSegments(
        grouped_works,
        time_range,
        current_time_mins,
        getWorkColor
    );

    const lunch_style = calculateLunchOverlayStyle(
        lunch_time.start,
        lunch_time.end,
        time_range
    );

    const is_now_in_range =
        current_time_mins >= time_range.start &&
        current_time_mins <= time_range.end;
    const now_left_pct = is_now_in_range
        ? ((current_time_mins - time_range.start) / total_range) * 100
        : -1;

    return (
        <div className="px-5 pb-4">
            {/* Hour labels */}
            <div className="flex justify-between mb-1.5 px-0.5">
                {hour_labels.map((h) => (
                    <span
                        key={h}
                        className="text-[10px] text-gray-400 tabular-nums"
                    >
                        {h}
                    </span>
                ))}
            </div>

            {/* Bar track wrapper */}
            <div className="relative h-10">
                {/* Background + lunch zone (clipped) */}
                <div className="absolute inset-0 rounded-lg bg-gray-50 overflow-hidden">
                    {lunch_style && (
                        <div
                            className="absolute top-0 h-full pointer-events-none"
                            style={{
                                left: lunch_style.left,
                                width: lunch_style.width,
                                background:
                                    "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 6px)",
                            }}
                        />
                    )}
                </div>

                {/* Session segments (not clipped) */}
                {segments.map((seg, idx) => {
                    const is_active = active_work_id === seg.work_key;
                    return (
                        <div
                            key={`${seg.session.id}-${idx}`}
                            className={`absolute top-1 bottom-1 rounded-[2px] cursor-pointer transition-all duration-200 ${
                                is_active ? "brightness-110 opacity-90" : ""
                            } ${seg.is_running ? "mobile-gantt-shimmer" : ""}`}
                            style={{
                                left: `${seg.left_pct}%`,
                                width: `${seg.width_pct}%`,
                                background: seg.color,
                                zIndex: is_active ? 5 : 1,
                                boxShadow: is_active
                                    ? `0 0 0 2px white, 0 0 0 3.5px ${seg.color}`
                                    : undefined,
                            }}
                            onClick={() => onSegmentTap(seg.work_key)}
                        />
                    );
                })}

                {/* Current time indicator (not clipped) */}
                {is_now_in_range && (
                    <div
                        className="absolute top-0 h-full z-10 pointer-events-none"
                        style={{ left: `${now_left_pct}%` }}
                    >
                        <div className="absolute top-0 bottom-0 w-0.5 bg-error -translate-x-1/2" />
                        <div className="w-2.5 h-2.5 rounded-full bg-error absolute -top-1.5 -translate-x-1/2 border border-white" />
                    </div>
                )}
            </div>
        </div>
    );
}
