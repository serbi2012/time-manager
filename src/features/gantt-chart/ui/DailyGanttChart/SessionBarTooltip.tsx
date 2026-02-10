/**
 * Gantt bar hover tooltip — Clean Card style (Option A)
 */

import { ClockCircleOutlined, WarningFilled } from "@ant-design/icons";
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

const TOOLTIP_WIDTH = 280;

const CLOCK_ICON_STYLE: React.CSSProperties = {
    color: "#8B95A1",
    fontSize: 13,
};
const WARNING_ICON_STYLE: React.CSSProperties = {
    color: "#F04452",
    fontSize: 12,
};
const CONFLICT_BG_STYLE: React.CSSProperties = {
    background: "rgba(240, 68, 82, 0.06)",
};

export function SessionBarTooltip({
    record,
    session,
    sessions_count,
    total_duration_formatted,
    is_conflicting,
}: SessionBarTooltipProps) {
    const duration_formatted = formatDuration(getSessionMinutes(session));

    return (
        <div style={{ width: TOOLTIP_WIDTH }}>
            {/* Header */}
            <div className="px-lg pt-lg pb-md">
                <div className="text-md font-semibold text-gray-900 leading-snug">
                    {record.deal_name || record.work_name}
                </div>
                {record.deal_name && (
                    <div className="text-sm text-gray-500 mt-xs leading-snug">
                        {record.work_name}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="mx-lg h-px bg-gray-100" />

            {/* Time Info */}
            <div className="px-lg py-md flex items-center gap-sm">
                <ClockCircleOutlined style={CLOCK_ICON_STYLE} />
                <span className="text-sm text-gray-700">
                    {session.start_time} - {session.end_time || "진행 중"}
                </span>
                <span className="text-sm font-semibold text-primary ml-auto">
                    {duration_formatted}
                </span>
            </div>

            {/* Conflict Warning */}
            {is_conflicting && (
                <div
                    className="mx-lg mb-md px-md py-sm rounded-md flex items-center gap-sm"
                    style={CONFLICT_BG_STYLE}
                >
                    <WarningFilled style={WARNING_ICON_STYLE} />
                    <span className="text-xs text-error">
                        {GANTT_LABEL_CONFLICT_WARNING}
                    </span>
                </div>
            )}

            {/* Footer */}
            <div className="px-lg py-sm bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    {GANTT_LABEL_TOTAL_SESSIONS(
                        sessions_count,
                        total_duration_formatted
                    )}
                </span>
            </div>
        </div>
    );
}
