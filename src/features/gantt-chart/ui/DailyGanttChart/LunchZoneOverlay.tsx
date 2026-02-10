/**
 * Lunch zone overlay (subtle striped zone with pill badge)
 */

import { CoffeeOutlined } from "@ant-design/icons";
import { GANTT_LABEL_LUNCH_ZONE } from "../../constants";

interface LunchZoneOverlayProps {
    style: { left: string; width: string };
}

export function LunchZoneOverlay({ style }: LunchZoneOverlayProps) {
    return (
        <div className="gantt-lunch-overlay" style={style}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[2px]">
                <CoffeeOutlined style={{ fontSize: 14, color: "#B0B8C1" }} />
                <span className="text-[10px] font-medium text-gray-400 tracking-wide">
                    {GANTT_LABEL_LUNCH_ZONE}
                </span>
            </div>
        </div>
    );
}
