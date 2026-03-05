/**
 * Mobile gantt segment bar
 * - Horizontal timeline bar showing all sessions as colored segments
 * - Lunch zone overlay (striped pattern)
 * - Current time indicator (red line + dot)
 * - Tap segment to highlight corresponding work card
 * - Long-press segment for session edit/delete
 */

import { useRef, useCallback } from "react";

import type { WorkRecord, WorkSession } from "../../../../shared/types";
import type { GroupedWork } from "../../lib/slot_calculator";
import type { TimeRange } from "../../lib/bar_calculator";
import { calculateLunchOverlayStyle } from "../../lib/bar_calculator";
import {
    buildSegments,
    buildHourLabels,
    type SegmentData,
} from "../../lib/mobile_segment_calculator";
import { triggerHaptic } from "@/shared/lib/haptic";

const LONG_PRESS_DELAY_MS = 500;
const MOVE_THRESHOLD = 10;

interface MobileGanttSegmentBarProps {
    grouped_works: GroupedWork[];
    time_range: TimeRange;
    current_time_mins: number;
    lunch_time: { start: number; end: number };
    active_work_id: string | null;
    getWorkColor: (record: WorkRecord) => string;
    onSegmentTap: (work_id: string) => void;
    onSegmentLongPress?: (
        record: WorkRecord,
        session: WorkSession,
        anchor_rect: DOMRect
    ) => void;
}

export function MobileGanttSegmentBar({
    grouped_works,
    time_range,
    current_time_mins,
    lunch_time,
    active_work_id,
    getWorkColor,
    onSegmentTap,
    onSegmentLongPress,
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
                {segments.map((seg, idx) => (
                    <SegmentBlock
                        key={`${seg.session.id}-${idx}`}
                        seg={seg}
                        is_active={active_work_id === seg.work_key}
                        onTap={() => onSegmentTap(seg.work_key)}
                        onLongPress={onSegmentLongPress}
                    />
                ))}

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

interface SegmentBlockProps {
    seg: SegmentData;
    is_active: boolean;
    onTap: () => void;
    onLongPress?: (
        record: WorkRecord,
        session: WorkSession,
        anchor_rect: DOMRect
    ) => void;
}

function SegmentBlock({ seg, is_active, onTap, onLongPress }: SegmentBlockProps) {
    const el_ref = useRef<HTMLDivElement>(null);
    const lp_timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lp_fired = useRef(false);
    const start_pos = useRef({ x: 0, y: 0 });

    const cancelLp = useCallback(() => {
        if (lp_timer.current) {
            clearTimeout(lp_timer.current);
            lp_timer.current = null;
        }
    }, []);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            lp_fired.current = false;
            start_pos.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            if (onLongPress) {
                lp_timer.current = setTimeout(() => {
                    lp_fired.current = true;
                    triggerHaptic();
                    const rect = el_ref.current?.getBoundingClientRect();
                    if (rect) onLongPress(seg.record, seg.session, rect);
                }, LONG_PRESS_DELAY_MS);
            }
        },
        [onLongPress, seg.record, seg.session]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            const dx = e.touches[0].clientX - start_pos.current.x;
            const dy = e.touches[0].clientY - start_pos.current.y;
            if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
                cancelLp();
            }
        },
        [cancelLp]
    );

    const handleTouchEnd = useCallback(() => {
        cancelLp();
        if (lp_fired.current) {
            lp_fired.current = false;
            return;
        }
        onTap();
    }, [cancelLp, onTap]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    return (
        <div
            ref={el_ref}
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={handleContextMenu}
        />
    );
}
