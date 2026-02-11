/**
 * Mobile gantt empty state
 * - Shown when no work records exist for the selected date
 */

import { ClockCircleOutlined } from "@ant-design/icons";
import {
    GANTT_MOBILE_EMPTY_HINT,
    GANTT_MOBILE_EMPTY_SUB_HINT,
} from "../../constants";

export function MobileGanttEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-[48px] px-xl">
            <ClockCircleOutlined
                className="text-gray-300"
                style={{ fontSize: 48 }}
            />
            <span className="text-lg font-semibold text-gray-900 mt-lg">
                {GANTT_MOBILE_EMPTY_HINT}
            </span>
            <span className="text-sm text-gray-500 mt-xs">
                {GANTT_MOBILE_EMPTY_SUB_HINT}
            </span>
        </div>
    );
}
