/**
 * Lunch zone overlay (subtle striped zone with pill badge)
 * Hover tooltip shows lunch time range
 */

import { Tooltip } from "antd";
import { CoffeeOutlined } from "@ant-design/icons";
import { minutesToTime } from "../../../../shared/lib/time";
import { GANTT_LABEL_LUNCH, GANTT_LABEL_LUNCH_ZONE } from "../../constants";

interface LunchZoneOverlayProps {
    style: { left: string; width: string };
    lunch_start_mins: number;
    lunch_end_mins: number;
}

export function LunchZoneOverlay({
    style,
    lunch_start_mins,
    lunch_end_mins,
}: LunchZoneOverlayProps) {
    const tooltip_title = `${GANTT_LABEL_LUNCH} ${minutesToTime(
        lunch_start_mins
    )} ~ ${minutesToTime(lunch_end_mins)}`;

    return (
        <Tooltip title={tooltip_title}>
            <div className="gantt-lunch-overlay" style={style}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[2px]">
                    <CoffeeOutlined
                        style={{ fontSize: 14, color: "#B0B8C1" }}
                    />
                    <span className="text-[10px] font-medium text-gray-400 tracking-wide">
                        {GANTT_LABEL_LUNCH_ZONE}
                    </span>
                </div>
            </div>
        </Tooltip>
    );
}
