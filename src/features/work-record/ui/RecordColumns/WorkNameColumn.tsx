/**
 * 작업명 컬럼
 */

import { Tag } from "antd";
import type { WorkRecord } from "../../../../shared/types";

interface WorkNameColumnProps {
    record: WorkRecord;
    theme_color: string;
}

export function WorkNameColumn({ record, theme_color }: WorkNameColumnProps) {
    return (
        <Tag color={theme_color} style={{ fontSize: 11 }}>
            {record.work_name}
        </Tag>
    );
}
