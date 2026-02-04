/**
 * 시작-종료 시간 컬럼
 */

import { Typography } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { getTimeRangeForDate } from "../../lib/duration_calculator";

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
        <Text type="secondary" style={{ fontSize: 11 }}>
            {time_range.start_time?.slice(0, 5) || "-"} ~{" "}
            {time_range.end_time?.slice(0, 5) || "-"}
        </Text>
    );
}
