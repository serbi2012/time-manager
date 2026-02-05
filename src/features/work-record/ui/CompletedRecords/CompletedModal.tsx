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
import {
    RECORD_MODAL_TITLE,
    RECORD_TABLE_COLUMN,
    RECORD_BUTTON,
    RECORD_EMPTY,
    RECORD_UI_TEXT,
} from "../../constants";

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
            title: RECORD_TABLE_COLUMN.WORK_NAME,
            dataIndex: "work_name",
            key: "work_name",
            ellipsis: true,
        },
        {
            title: RECORD_TABLE_COLUMN.DEAL_NAME,
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
        },
        {
            title: RECORD_TABLE_COLUMN.CATEGORY,
            dataIndex: "category_name",
            key: "category_name",
            render: (category: string) => (
                <Tag color={getCategoryColor(category)}>{category}</Tag>
            ),
        },
        {
            title: RECORD_TABLE_COLUMN.DURATION,
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            render: (mins: number) => formatDuration(mins),
        },
        {
            title: RECORD_TABLE_COLUMN.COMPLETED_DATE,
            dataIndex: "completed_at",
            key: "completed_at",
            render: (date: string) =>
                date
                    ? new Date(date).toLocaleString("ko-KR")
                    : RECORD_UI_TEXT.EMPTY_VALUE,
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
                    {RECORD_BUTTON.RESTORE}
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title={RECORD_MODAL_TITLE.COMPLETED}
            open={open}
            onCancel={on_close}
            footer={null}
            width={800}
        >
            {records.length === 0 ? (
                <Empty description={RECORD_EMPTY.NO_COMPLETED} />
            ) : (
                <>
                    <Space style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                            {RECORD_UI_TEXT.COMPLETED_WORK_COUNT(
                                records.length
                            )}
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
