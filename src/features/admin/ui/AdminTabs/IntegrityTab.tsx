/**
 * 정합성 검사 탭
 */

import { IntegrityChecker } from "../IntegrityCheck";
import type { WorkRecord } from "../../../../shared/types";

interface IntegrityTabProps {
    records: WorkRecord[];
    on_fix_time_mismatch: (record_id: string, new_duration: number) => void;
    on_delete_session: (record_id: string, session_id: string) => void;
}

export function IntegrityTab({
    records,
    on_fix_time_mismatch,
    on_delete_session,
}: IntegrityTabProps) {
    return (
        <IntegrityChecker
            records={records}
            on_fix_time_mismatch={on_fix_time_mismatch}
            on_delete_session={on_delete_session}
        />
    );
}
