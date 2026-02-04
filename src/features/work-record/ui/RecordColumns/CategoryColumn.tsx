/**
 * 카테고리 컬럼
 */

import { Tag } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { getCategoryColor } from "../../lib/category_utils";
import { RECORD_UI_TEXT } from "../../constants";

interface CategoryColumnProps {
    record: WorkRecord;
}

export function CategoryColumn({ record }: CategoryColumnProps) {
    if (!record.category_name) {
        return <>{RECORD_UI_TEXT.EMPTY_VALUE}</>;
    }

    return (
        <Tag color={getCategoryColor(record.category_name)}>
            {record.category_name}
        </Tag>
    );
}
