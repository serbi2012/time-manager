/**
 * 레코드 필터 영역
 */

import { Input, Select, Space, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { RecordFilters as RecordFiltersType } from "../../hooks/useRecordFilters";
import {
    RECORD_CATEGORY_OPTIONS,
    RECORD_PLACEHOLDER,
    RECORD_UI_TEXT,
} from "../../constants";

const { Search } = Input;

interface RecordFiltersProps {
    filters: RecordFiltersType;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string | null) => void;
    onShowCompletedChange: (checked: boolean) => void;
}

export function RecordFilters({
    filters,
    onSearchChange,
    onCategoryChange,
    onShowCompletedChange,
}: RecordFiltersProps) {
    return (
        <Space
            style={{
                marginBottom: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
            }}
        >
            <Search
                placeholder={RECORD_PLACEHOLDER.SEARCH}
                allowClear
                value={filters.search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
            />

            <Select
                placeholder={RECORD_PLACEHOLDER.CATEGORY}
                allowClear
                value={filters.selected_category}
                onChange={onCategoryChange}
                style={{ width: 120 }}
                options={[
                    { value: null, label: RECORD_PLACEHOLDER.CATEGORY_ALL },
                    ...RECORD_CATEGORY_OPTIONS,
                ]}
            />

            <Checkbox
                checked={filters.show_completed}
                onChange={(e) => onShowCompletedChange(e.target.checked)}
            >
                {RECORD_UI_TEXT.SHOW_COMPLETED}
            </Checkbox>
        </Space>
    );
}
