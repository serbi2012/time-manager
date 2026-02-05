/**
 * 주간 범위 표시 텍스트
 */

import { Typography } from "antd";
import type { Dayjs } from "dayjs";
import { WEEKLY_WEEK_RANGE_STYLE } from "../../constants/styles";

const { Text } = Typography;

export interface WeekRangeTextProps {
    week_start: Dayjs;
    week_end: Dayjs;
}

export function WeekRangeText({ week_start, week_end }: WeekRangeTextProps) {
    return (
        <div className="week-range" style={WEEKLY_WEEK_RANGE_STYLE}>
            <Text type="secondary">
                {week_start.format("YYYY년 M월 D일")} ~{" "}
                {week_end.format("M월 D일")}
            </Text>
        </div>
    );
}
