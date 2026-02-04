/**
 * 시작-종료 시간 컬럼
 */

import { Typography } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { getTimeRangeForDate } from "../../lib/duration_calculator";
import {
    RECORD_FONT_SMALL_STYLE,
    RECORD_UI_TEXT,
    TIME_SLICE_END,
} from "../../constants";

const { Text } = Typography;

interface TimeRangeColumnProps {
    record: WorkRecord;
    selected_date: string;
}

export function TimeRangeColumn({
    record,
    selected_date,
}: TimeRangeColumnProps) {
    const time_range = getTimeRangeForDate(record, selected_date);

    return (
        <Text type="secondary" style={RECORD_FONT_SMALL_STYLE}>
            {time_range.start_time?.slice(0, TIME_SLICE_END) ||
                RECORD_UI_TEXT.EMPTY_VALUE}
            {RECORD_UI_TEXT.TIME_SEPARATOR}
            {time_range.end_time?.slice(0, TIME_SLICE_END) ||
                RECORD_UI_TEXT.EMPTY_VALUE}
        </Text>
    );
}
