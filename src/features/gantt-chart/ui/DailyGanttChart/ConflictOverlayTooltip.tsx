/**
 * 충돌 구간 오버레이 툴팁 내용
 */

import { minutesToTime } from "../../../../shared/lib/time";
import { GANTT_LABEL_CONFLICT_DETECTED } from "../../constants";

export interface ConflictOverlayTooltipProps {
    start_mins: number;
    end_mins: number;
}

/**
 * 충돌 구간 호버 시 표시되는 툴팁 내용
 */
export function ConflictOverlayTooltip({
    start_mins,
    end_mins,
}: ConflictOverlayTooltipProps) {
    return (
        <div>
            <div className="font-bold text-[#ff4d4f]">
                {GANTT_LABEL_CONFLICT_DETECTED}
            </div>
            <div>
                {minutesToTime(start_mins)} ~ {minutesToTime(end_mins)}
            </div>
        </div>
    );
}
