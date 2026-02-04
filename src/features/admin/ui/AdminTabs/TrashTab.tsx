/**
 * 휴지통 탭
 */

import { TrashManager } from "../TrashManagement";
import type { WorkRecord } from "../../../../shared/types";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";

interface TrashTabProps {
    records: WorkRecord[];
    time_format: TimeDisplayFormat;
    on_restore: (record_id: string) => void;
    on_permanent_delete: (record_id: string) => void;
}

export function TrashTab({
    records,
    time_format,
    on_restore,
    on_permanent_delete,
}: TrashTabProps) {
    return (
        <TrashManager
            records={records}
            on_restore={on_restore}
            on_permanent_delete={on_permanent_delete}
            time_format={time_format}
        />
    );
}
