/**
 * Mobile segment bar calculation utilities
 */

import { timeToMinutes } from "../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../shared/types";
import type { GroupedWork } from "./slot_calculator";
import type { TimeRange } from "./bar_calculator";

export interface SegmentData {
    session: WorkSession;
    record: WorkRecord;
    work_key: string;
    left_pct: number;
    width_pct: number;
    color: string;
    is_running: boolean;
}

export function buildSegments(
    grouped_works: GroupedWork[],
    time_range: TimeRange,
    current_time_mins: number,
    getWorkColor: (record: WorkRecord) => string
): SegmentData[] {
    const total_range = time_range.end - time_range.start;
    if (total_range <= 0) return [];

    const segments: SegmentData[] = [];

    grouped_works.forEach((group) => {
        const color = getWorkColor(group.record);
        group.sessions.forEach((session) => {
            const start_mins = timeToMinutes(session.start_time);
            const is_running = !session.end_time;
            const end_mins = is_running
                ? current_time_mins
                : timeToMinutes(session.end_time);

            const left_pct =
                ((start_mins - time_range.start) / total_range) * 100;
            const width_pct = ((end_mins - start_mins) / total_range) * 100;

            segments.push({
                session,
                record: group.record,
                work_key: group.key,
                left_pct: Math.max(0, left_pct),
                width_pct: Math.max(0.5, Math.min(width_pct, 100 - left_pct)),
                color,
                is_running,
            });
        });
    });

    return segments;
}

export function buildHourLabels(time_range: TimeRange): number[] {
    const labels: number[] = [];
    const start_hour = Math.floor(time_range.start / 60);
    const end_hour = Math.ceil(time_range.end / 60);
    for (let h = start_hour; h <= end_hour; h++) {
        labels.push(h);
    }
    return labels;
}

export function formatSessionRange(
    session: WorkSession,
    is_running: boolean,
    running_label: string
): string {
    if (is_running) {
        return `${session.start_time} ~ ${running_label}`;
    }
    return `${session.start_time} ~ ${session.end_time}`;
}
