/**
 * Gantt bar hover tooltip (centered style)
 */

import {
    GANTT_LABEL_CONFLICT_WARNING,
    GANTT_LABEL_TOTAL_SESSIONS,
} from "../../constants";
import { formatDuration } from "../../../../shared/lib/time";
import { getSessionMinutes } from "../../../../shared/lib/session";
import type { WorkRecord, WorkSession } from "../../../../shared/types";

export interface SessionBarTooltipProps {
    record: WorkRecord;
    session: WorkSession;
    sessions_count: number;
    total_duration_formatted: string;
    is_conflicting: boolean;
}

export function SessionBarTooltip({
    record,
    session,
    sessions_count,
    total_duration_formatted,
    is_conflicting,
}: SessionBarTooltipProps) {
    const duration_formatted = formatDuration(getSessionMinutes(session));

    return (
        <div className="text-center">
            <div className="font-medium">
                {record.deal_name || record.work_name}
            </div>
            {record.deal_name && (
                <div className="text-gray-300">{record.work_name}</div>
            )}
            <div className="text-gray-300">
                {session.start_time} - {session.end_time} ({duration_formatted})
            </div>
            {is_conflicting && (
                <div className="mt-xs text-error">
                    {GANTT_LABEL_CONFLICT_WARNING}
                </div>
            )}
            <div className="mt-xs text-xs text-text-disabled">
                {GANTT_LABEL_TOTAL_SESSIONS(
                    sessions_count,
                    total_duration_formatted
                )}
            </div>
        </div>
    );
}
