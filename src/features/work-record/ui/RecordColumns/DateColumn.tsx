/**
 * 날짜 컬럼
 */

import { Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

interface DateColumnProps {
    date: string;
}

export function DateColumn({ date }: DateColumnProps) {
    const today = dayjs().format("YYYY-MM-DD");
    const is_past = date < today;

    return (
        <Text type={is_past ? "warning" : "secondary"} style={{ fontSize: 11 }}>
            {date === today ? "오늘" : date.slice(5)}
        </Text>
    );
}
