/**
 * 중복 레코드 뷰 컴포넌트
 */

import { Table, Button, Typography, Empty, Space, Tag } from "antd";
import { MergeCellsOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { DuplicatesViewProps } from "../../lib/types";
import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";
import {
    DUPLICATES_LABEL,
    TABLE_COL_WORK_NAME,
    TABLE_COL_DEAL_NAME,
    TABLE_COL_DATE,
    TABLE_COL_TIME,
    TABLE_COL_SESSIONS,
    MERGE,
    STATS_LABEL,
    EXPLORER_LABEL,
} from "../../constants";

const { Text } = Typography;

type DuplicateGroup = DuplicatesViewProps["duplicates"][0];

/**
 * 중복 레코드 뷰 컴포넌트
 * 같은 work_name + deal_name을 가진 레코드 그룹을 표시
 */
export function DuplicatesView({ duplicates, on_merge }: DuplicatesViewProps) {
    if (duplicates.length === 0) {
        return <Empty description={DUPLICATES_LABEL.noDuplicates} />;
    }

    const group_columns: ColumnsType<DuplicateGroup> = [
        {
            title: TABLE_COL_WORK_NAME,
            dataIndex: "work_name",
            key: "work_name",
            ellipsis: true,
        },
        {
            title: TABLE_COL_DEAL_NAME,
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
        },
        {
            title: DUPLICATES_LABEL.duplicateCount,
            key: "count",
            width: 100,
            render: (_, group) => (
                <Tag color="blue">
                    {group.records.length}
                    {STATS_LABEL.unit_count}
                </Tag>
            ),
        },
        {
            title: "",
            key: "action",
            width: 100,
            render: (_, group) => (
                <Button
                    type="primary"
                    icon={<MergeCellsOutlined />}
                    onClick={() => on_merge(group.records)}
                    size="small"
                >
                    {MERGE}
                </Button>
            ),
        },
    ];

    // 확장 가능한 행: 개별 레코드 목록 표시
    const expand_render = (group: DuplicateGroup) => {
        const record_columns: ColumnsType<WorkRecord> = [
            {
                title: TABLE_COL_DATE,
                dataIndex: "date",
                key: "date",
                width: 100,
            },
            {
                title: TABLE_COL_TIME,
                key: "time",
                render: (_, record) => (
                    <Text type="secondary">
                        {record.start_time} ~ {record.end_time}
                    </Text>
                ),
            },
            {
                title: EXPLORER_LABEL.duration,
                key: "duration",
                width: 100,
                render: (_, record) => formatDuration(record.duration_minutes),
            },
            {
                title: TABLE_COL_SESSIONS,
                key: "sessions",
                width: 80,
                render: (_, record) => (
                    <Tag>
                        {record.sessions?.length || 0}
                        {STATS_LABEL.unit_count}
                    </Tag>
                ),
            },
        ];

        return (
            <Table
                dataSource={group.records}
                columns={record_columns}
                rowKey="id"
                size="small"
                pagination={false}
            />
        );
    };

    return (
        <div>
            <Space className="!mb-lg">
                <Text type="secondary">
                    {DUPLICATES_LABEL.total} {duplicates.length}
                    {DUPLICATES_LABEL.duplicateGroupSuffix}
                </Text>
            </Space>
            <Table
                dataSource={duplicates}
                columns={group_columns}
                rowKey="key"
                size="small"
                pagination={{ pageSize: 10 }}
                expandable={{
                    expandedRowRender: expand_render,
                }}
            />
        </div>
    );
}

export default DuplicatesView;
