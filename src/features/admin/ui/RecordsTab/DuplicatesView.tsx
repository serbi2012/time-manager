/**
 * 중복 레코드 뷰 컴포넌트
 */

import { Table, Button, Typography, Empty, Space, Tag } from "antd";
import { MergeCellsOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { DuplicatesViewProps } from "../../lib/types";
import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";

const { Text } = Typography;

type DuplicateGroup = DuplicatesViewProps["duplicates"][0];

/**
 * 중복 레코드 뷰 컴포넌트
 * 같은 work_name + deal_name을 가진 레코드 그룹을 표시
 */
export function DuplicatesView({ duplicates, on_merge }: DuplicatesViewProps) {
    if (duplicates.length === 0) {
        return <Empty description="중복된 레코드가 없습니다." />;
    }

    const group_columns: ColumnsType<DuplicateGroup> = [
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            ellipsis: true,
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
        },
        {
            title: "중복 수",
            key: "count",
            width: 100,
            render: (_, group) => (
                <Tag color="blue">{group.records.length}개</Tag>
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
                    병합
                </Button>
            ),
        },
    ];

    // 확장 가능한 행: 개별 레코드 목록 표시
    const expand_render = (group: DuplicateGroup) => {
        const record_columns: ColumnsType<WorkRecord> = [
            {
                title: "날짜",
                dataIndex: "date",
                key: "date",
                width: 100,
            },
            {
                title: "시간",
                key: "time",
                render: (_, record) => (
                    <Text type="secondary">
                        {record.start_time} ~ {record.end_time}
                    </Text>
                ),
            },
            {
                title: "소요",
                key: "duration",
                width: 100,
                render: (_, record) => formatDuration(record.duration_minutes),
            },
            {
                title: "세션",
                key: "sessions",
                width: 80,
                render: (_, record) => (
                    <Tag>{record.sessions?.length || 0}개</Tag>
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
                    총 {duplicates.length}개의 중복 그룹
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
