/**
 * Duration column (Toss-style plain text)
 */

import type { WorkRecord } from "../../../../shared/types";
import { getRecordDurationForDate } from "../../lib/duration_calculator";
import { RECORD_UI_TEXT } from "../../constants";

interface DurationColumnProps {
    record: WorkRecord;
    selected_date: string;
}

export function DurationColumn({ record, selected_date }: DurationColumnProps) {
    const date_minutes = getRecordDurationForDate(record, selected_date);

    return (
        <span className="text-md font-medium text-text-primary">
            {date_minutes}
            {RECORD_UI_TEXT.MINUTE_UNIT}
        </span>
    );
}
