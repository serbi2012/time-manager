/**
 * 주간 범위 표시 텍스트
 */

import { Typography } from "antd";
import type { Dayjs } from "dayjs";

const { Text } = Typography;

export interface WeekRangeTextProps {
    week_start: Dayjs;
    week_end: Dayjs;
}

export function WeekRangeText({ week_start, week_end }: WeekRangeTextProps) {
    return (
        <div className="week-range">
            <Text type="secondary">
                {week_start.format("YYYY년 M월 D일")} ~{" "}
                {week_end.format("M월 D일")}
            </Text>
        </div>
    );
}
