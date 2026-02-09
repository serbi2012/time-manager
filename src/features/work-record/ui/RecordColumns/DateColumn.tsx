/**
 * 날짜 컬럼
 */

import { Typography } from "antd";
import dayjs from "dayjs";
import { DATE_FORMAT, DATE_SLICE_START, RECORD_UI_TEXT } from "../../constants";

const { Text } = Typography;

interface DateColumnProps {
    date: string;
}

export function DateColumn({ date }: DateColumnProps) {
    const today = dayjs().format(DATE_FORMAT);
    const is_past = date < today;

    return (
        <Text type={is_past ? "warning" : "secondary"} className="!text-xs">
            {date === today
                ? RECORD_UI_TEXT.TODAY_TEXT
                : date.slice(DATE_SLICE_START)}
        </Text>
    );
}
