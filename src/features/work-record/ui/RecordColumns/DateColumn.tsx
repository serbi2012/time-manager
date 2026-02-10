/**
 * Date column (Toss-style plain text)
 */

import dayjs from "dayjs";
import { DATE_FORMAT, DATE_SLICE_START, RECORD_UI_TEXT } from "../../constants";

interface DateColumnProps {
    date: string;
}

export function DateColumn({ date }: DateColumnProps) {
    const today = dayjs().format(DATE_FORMAT);

    return (
        <span className="text-sm text-text-secondary">
            {date === today
                ? RECORD_UI_TEXT.TODAY_TEXT
                : date.slice(DATE_SLICE_START)}
        </span>
    );
}
