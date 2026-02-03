/**
 * 충돌 구간 오버레이 툴팁 내용
 */

import { minutesToTime } from "../../../../shared/lib/time";
import {
    GANTT_LABEL_CONFLICT_DETECTED,
    GANTT_CONFLICT_COLOR,
} from "../../constants";

export interface ConflictOverlayTooltipProps {
    start_mins: number;
    end_mins: number;
}

const TITLE_STYLE: React.CSSProperties = {
    fontWeight: "bold",
    color: GANTT_CONFLICT_COLOR,
};

/**
 * 충돌 구간 호버 시 표시되는 툴팁 내용
 */
export function ConflictOverlayTooltip({
    start_mins,
    end_mins,
}: ConflictOverlayTooltipProps) {
    return (
        <div>
            <div style={TITLE_STYLE}>{GANTT_LABEL_CONFLICT_DETECTED}</div>
            <div>
                {minutesToTime(start_mins)} ~ {minutesToTime(end_mins)}
            </div>
        </div>
    );
}
