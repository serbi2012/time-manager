/**
 * 충돌 뷰 컴포넌트
 */

import { Table, Tag, Button, Typography, Empty, Space } from "antd";
import { ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ConflictsViewProps } from "../../lib/types";
import { formatDuration } from "../../../../shared/lib/time";
import { CONFLICTS_LABEL, TABLE_COL_DATE } from "../../constants";

const { Text } = Typography;

type ConflictItem = ConflictsViewProps["conflicts"][0];

/**
 * 충돌 뷰 컴포넌트
 * 시간이 겹치는 세션 쌍을 표시
 */
export function ConflictsView({ conflicts, on_resolve }: ConflictsViewProps) {
    if (conflicts.length === 0) {
        return <Empty description={CONFLICTS_LABEL.noConflicts} />;
    }

    const columns: ColumnsType<ConflictItem> = [
        {
            title: TABLE_COL_DATE,
            dataIndex: "date",
            key: "date",
            width: 100,
        },
        {
            title: CONFLICTS_LABEL.session1,
            key: "session1",
            render: (_, item) => (
                <div>
                    <Text strong>{item.session1.work_name}</Text>
                    <br />
                    <Text type="secondary" className="!text-xs">
                        {item.session1.start_time} ~ {item.session1.end_time}
                    </Text>
                </div>
            ),
        },
        {
            title: CONFLICTS_LABEL.session2,
            key: "session2",
            render: (_, item) => (
                <div>
                    <Text strong>{item.session2.work_name}</Text>
                    <br />
                    <Text type="secondary" className="!text-xs">
                        {item.session2.start_time} ~ {item.session2.end_time}
                    </Text>
                </div>
            ),
        },
        {
            title: CONFLICTS_LABEL.overlap,
            key: "overlap",
            width: 100,
            render: (_, item) => (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>
                    {formatDuration(item.overlap_minutes)}
                </Tag>
            ),
        },
        {
            title: "",
            key: "action",
            width: 100,
            render: (_, item) => (
                <Button
                    type="text"
                    icon={<ToolOutlined />}
                    onClick={() => on_resolve(item)}
                    size="small"
                >
                    {CONFLICTS_LABEL.resolve}
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Space className="!mb-lg">
                <Text type="secondary">
                    {CONFLICTS_LABEL.total} {conflicts.length}
                    {CONFLICTS_LABEL.conflictCountSuffix}
                </Text>
            </Space>
            <Table
                dataSource={conflicts}
                columns={columns}
                rowKey={(item) => `${item.session1.id}-${item.session2.id}`}
                size="small"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
}

export default ConflictsView;
