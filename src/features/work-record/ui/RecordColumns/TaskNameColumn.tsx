/**
 * 업무명 컬럼
 */

import { Tag } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { RECORD_UI_TEXT } from "../../constants";

interface TaskNameColumnProps {
    record: WorkRecord;
}

export function TaskNameColumn({ record }: TaskNameColumnProps) {
    return record.task_name ? (
        <Tag color="cyan">{record.task_name}</Tag>
    ) : (
        <>{RECORD_UI_TEXT.EMPTY_VALUE}</>
    );
}
