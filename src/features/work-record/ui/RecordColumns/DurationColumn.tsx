/**
 * 소요 시간 컬럼
 */

import { Typography } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { getRecordDurationForDate } from "../../lib/duration_calculator";

const { Text } = Typography;

interface DurationColumnProps {
    record: WorkRecord;
    selected_date: string;
    theme_color: string;
}

export function DurationColumn({
    record,
    selected_date,
    theme_color,
}: DurationColumnProps) {
    const date_minutes = getRecordDurationForDate(record, selected_date);

    return (
        <Text strong style={{ color: theme_color }}>
            {date_minutes}분
        </Text>
    );
}
