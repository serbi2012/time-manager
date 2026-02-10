/**
 * Task name column (Toss-style plain text)
 */

import type { WorkRecord } from "../../../../shared/types";
import { RECORD_UI_TEXT } from "../../constants";

interface TaskNameColumnProps {
    record: WorkRecord;
}

export function TaskNameColumn({ record }: TaskNameColumnProps) {
    return record.task_name ? (
        <span className="text-md text-gray-700">{record.task_name}</span>
    ) : (
        <span className="text-text-disabled">{RECORD_UI_TEXT.EMPTY_VALUE}</span>
    );
}
