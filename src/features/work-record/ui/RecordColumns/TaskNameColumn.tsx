/**
 * 업무명 컬럼
 */

import { Tag } from "antd";
import type { WorkRecord } from "../../../../shared/types";

interface TaskNameColumnProps {
    record: WorkRecord;
}

export function TaskNameColumn({ record }: TaskNameColumnProps) {
    return record.task_name ? (
        <Tag color="cyan">{record.task_name}</Tag>
    ) : (
        <>-</>
    );
}
