/**
 * 충돌 뷰 컴포넌트
 */

import { Table, Tag, Button, Typography, Empty, Space } from "antd";
import { ExclamationCircleOutlined, ToolOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ConflictsViewProps } from "../../lib/types";
import { formatDuration } from "../../../../shared/lib/time";

const { Text } = Typography;

type ConflictItem = ConflictsViewProps["conflicts"][0];

/**
 * 충돌 뷰 컴포넌트
 * 시간이 겹치는 세션 쌍을 표시
 */
export function ConflictsView({
    conflicts,
    on_resolve,
}: ConflictsViewProps) {
    if (conflicts.length === 0) {
        return <Empty description="충돌이 없습니다." />;
    }

    const columns: ColumnsType<ConflictItem> = [
        {
            title: "날짜",
            dataIndex: "date",
            key: "date",
            width: 100,
        },
        {
            title: "세션 1",
            key: "session1",
            render: (_, item) => (
                <div>
                    <Text strong>{item.session1.work_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.session1.start_time} ~ {item.session1.end_time}
                    </Text>
                </div>
            ),
        },
        {
            title: "세션 2",
            key: "session2",
            render: (_, item) => (
                <div>
                    <Text strong>{item.session2.work_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.session2.start_time} ~ {item.session2.end_time}
                    </Text>
                </div>
            ),
        },
        {
            title: "겹침",
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
                    해결
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    총 {conflicts.length}개의 충돌
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
