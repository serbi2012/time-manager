/**
 * 간트 바 호버 툴팁 내용
 */

import {
    GANTT_TOOLTIP_CONFLICT_MARGIN_TOP,
    GANTT_TOOLTIP_FOOTER_MARGIN_TOP,
    GANTT_CONFLICT_COLOR,
    GANTT_TEXT_HINT,
    GANTT_FONT_XSMALL,
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

const CONFLICT_STYLE: React.CSSProperties = {
    marginTop: GANTT_TOOLTIP_CONFLICT_MARGIN_TOP,
    color: GANTT_CONFLICT_COLOR,
};

const FOOTER_STYLE: React.CSSProperties = {
    marginTop: GANTT_TOOLTIP_FOOTER_MARGIN_TOP,
    fontSize: GANTT_FONT_XSMALL,
    color: GANTT_TEXT_HINT,
};

/**
 * 간트 바 호버 시 표시되는 툴팁 내용
 */
export function SessionBarTooltip({
    record,
    session,
    sessions_count,
    total_duration_formatted,
    is_conflicting,
}: SessionBarTooltipProps) {
    const duration_formatted = formatDuration(getSessionMinutes(session));

    return (
        <div>
            <div>
                <strong>{record.work_name}</strong>
            </div>
            {record.deal_name && <div>{record.deal_name}</div>}
            <div>
                {session.start_time} ~ {session.end_time}
            </div>
            <div>{duration_formatted}</div>
            {is_conflicting && (
                <div style={CONFLICT_STYLE}>{GANTT_LABEL_CONFLICT_WARNING}</div>
            )}
            <div style={FOOTER_STYLE}>
                {GANTT_LABEL_TOTAL_SESSIONS(
                    sessions_count,
                    total_duration_formatted
                )}
            </div>
        </div>
    );
}
