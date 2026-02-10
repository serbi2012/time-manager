/**
 * Work name column (Toss-style plain text)
 */

import type { WorkRecord } from "../../../../shared/types";

interface WorkNameColumnProps {
    record: WorkRecord;
    is_active?: boolean;
}

const MAX_DISPLAY_LENGTH = 20;

export function WorkNameColumn({ record, is_active }: WorkNameColumnProps) {
    const display_name =
        record.work_name.length > MAX_DISPLAY_LENGTH
            ? record.work_name.slice(0, MAX_DISPLAY_LENGTH) + "..."
            : record.work_name;

    return (
        <span
            className={`text-md ${
                is_active ? "text-primary" : "text-text-primary"
            }`}
        >
            {display_name}
        </span>
    );
}
