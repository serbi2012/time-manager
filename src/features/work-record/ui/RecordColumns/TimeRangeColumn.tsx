/**
 * Time range column (Toss-style plain text)
 */

import type { WorkRecord } from "../../../../shared/types";
import { getTimeRangeForDate } from "../../lib/duration_calculator";
import { RECORD_UI_TEXT, TIME_SLICE_END } from "../../constants";

interface TimeRangeColumnProps {
    record: WorkRecord;
    selected_date: string;
}

export function TimeRangeColumn({
    record,
    selected_date,
}: TimeRangeColumnProps) {
    const time_range = getTimeRangeForDate(record, selected_date);
    const start = time_range.start_time?.slice(0, TIME_SLICE_END);
    const end = time_range.end_time?.slice(0, TIME_SLICE_END);

    if (!start && !end) {
        return (
            <span className="text-sm text-text-secondary">
                {RECORD_UI_TEXT.EMPTY_VALUE} {RECORD_UI_TEXT.EMPTY_VALUE}{" "}
                {RECORD_UI_TEXT.EMPTY_VALUE}
            </span>
        );
    }

    return (
        <span className="text-sm text-text-secondary">
            {start || RECORD_UI_TEXT.EMPTY_VALUE}-
            {end || RECORD_UI_TEXT.EMPTY_VALUE}
        </span>
    );
}
