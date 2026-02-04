/**
 * 작업명 컬럼
 */

import { Tag } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { RECORD_FONT_SMALL_STYLE } from "../../constants";

interface WorkNameColumnProps {
    record: WorkRecord;
    theme_color: string;
}

export function WorkNameColumn({ record, theme_color }: WorkNameColumnProps) {
    return (
        <Tag color={theme_color} style={RECORD_FONT_SMALL_STYLE}>
            {record.work_name}
        </Tag>
    );
}
