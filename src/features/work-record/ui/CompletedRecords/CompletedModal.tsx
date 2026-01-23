/**
 * 완료된 작업 모달 컴포넌트
 */

import { Modal, Table, Button, Empty, Typography, Tag, Space } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CompletedModalProps } from "../../lib/types";
import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";
import { getCategoryColor } from "../../../../shared/config";

const { Text } = Typography;

/**
 * 완료된 작업 목록 모달
 */
export function CompletedModal({
    open,
    on_close,
    records,
    on_restore,
}: CompletedModalProps) {
    const columns: ColumnsType<WorkRecord> = [
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
            title: "카테고리",
            dataIndex: "category_name",
            key: "category_name",
            render: (category: string) => (
                <Tag color={getCategoryColor(category)}>{category}</Tag>
            ),
        },
        {
            title: "소요 시간",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            render: (mins: number) => formatDuration(mins),
        },
        {
            title: "완료 일시",
            dataIndex: "completed_at",
            key: "completed_at",
            render: (date: string) =>
                date ? new Date(date).toLocaleString("ko-KR") : "-",
        },
        {
            title: "",
            key: "action",
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<RollbackOutlined />}
                    onClick={() => on_restore(record)}
                >
                    복원
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title="완료된 작업"
            open={open}
            onCancel={on_close}
            footer={null}
            width={800}
        >
            {records.length === 0 ? (
                <Empty description="완료된 작업이 없습니다." />
            ) : (
                <>
                    <Space style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                            총 {records.length}개의 완료된 작업
                        </Text>
                    </Space>
                    <Table
                        dataSource={records}
                        columns={columns}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 10 }}
                    />
                </>
            )}
        </Modal>
    );
}

export default CompletedModal;
