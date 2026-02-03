/**
 * 점심시간 오버레이 컴포넌트
 */

import { Tooltip } from "antd";
import type { LunchOverlayProps } from "../../lib/types";
import {
    LUNCH_START_MINUTES,
    LUNCH_END_MINUTES,
} from "../../../../shared/lib/lunch";
import { GANTT_LABEL_LUNCH_TIME_RANGE } from "../../constants";

/**
 * 점심시간 오버레이 컴포넌트
 * 점심시간 영역을 시각적으로 표시
 */
export function LunchOverlay({
    start_hour,
    pixels_per_hour,
}: LunchOverlayProps) {
    const lunch_start_px =
        ((LUNCH_START_MINUTES - start_hour * 60) / 60) * pixels_per_hour;
    const lunch_width_px =
        ((LUNCH_END_MINUTES - LUNCH_START_MINUTES) / 60) * pixels_per_hour;

    return (
        <Tooltip title={GANTT_LABEL_LUNCH_TIME_RANGE}>
            <div
                className="gantt-lunch-overlay"
                style={{
                    left: lunch_start_px,
                    width: lunch_width_px,
                }}
            />
            <style>{`
                .gantt-lunch-overlay {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 4px,
                        rgba(0, 0, 0, 0.03) 4px,
                        rgba(0, 0, 0, 0.03) 8px
                    );
                    border-left: 1px dashed #d9d9d9;
                    border-right: 1px dashed #d9d9d9;
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>
        </Tooltip>
    );
}

export default LunchOverlay;
