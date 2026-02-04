/**
 * 카테고리 컬럼
 */

import { Tag } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { getCategoryColor } from "../../lib/category_utils";

interface CategoryColumnProps {
    record: WorkRecord;
}

export function CategoryColumn({ record }: CategoryColumnProps) {
    if (!record.category_name) {
        return <>-</>;
    }

    return (
        <Tag color={getCategoryColor(record.category_name)}>
            {record.category_name}
        </Tag>
    );
}
