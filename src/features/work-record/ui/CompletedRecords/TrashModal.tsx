/**
 * 휴지통 모달 컴포넌트
 */

import {
    Modal,
    Table,
    Button,
    Empty,
    Typography,
    Popconfirm,
    Space,
} from "antd";
import { RollbackOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TrashModalProps } from "../../lib/types";
import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";
import {
    RECORD_MODAL_TITLE,
    RECORD_TABLE_COLUMN,
    RECORD_BUTTON,
    RECORD_EMPTY,
    RECORD_UI_TEXT,
    RECORD_CONFIRM,
} from "../../constants";

const { Text } = Typography;

/**
 * 휴지통 모달
 * 소프트 삭제된 레코드 복원 또는 영구 삭제
 */
export function TrashModal({
    open,
    on_close,
    records,
    on_restore,
    on_permanent_delete,
}: TrashModalProps) {
    // 삭제일 기준 내림차순 정렬 (최신 삭제가 위로)
    const sorted_records = [...records].sort((a, b) => {
        const date_a = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
        const date_b = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
        return date_b - date_a;
    });

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
            title: RECORD_TABLE_COLUMN.DURATION,
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            render: (mins: number) => formatDuration(mins),
        },
        {
            title: RECORD_TABLE_COLUMN.DELETED_DATE,
            dataIndex: "deleted_at",
            key: "deleted_at",
            render: (date: string) =>
                date
                    ? new Date(date).toLocaleString("ko-KR")
                    : RECORD_UI_TEXT.EMPTY_VALUE,
        },
        {
            title: "",
            key: "action",
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<RollbackOutlined />}
                        onClick={() => on_restore(record)}
                    >
                        {RECORD_BUTTON.RESTORE}
                    </Button>
                    <Popconfirm
                        title={RECORD_CONFIRM.PERMANENT_DELETE.TITLE}
                        description={
                            RECORD_CONFIRM.PERMANENT_DELETE.DESCRIPTION
                        }
                        onConfirm={() => on_permanent_delete(record)}
                        okText={RECORD_BUTTON.DELETE}
                        cancelText={RECORD_BUTTON.CANCEL}
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            {RECORD_BUTTON.DELETE}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Modal
            title={RECORD_MODAL_TITLE.TRASH}
            open={open}
            onCancel={on_close}
            footer={null}
            width={800}
        >
            {records.length === 0 ? (
                <Empty description={RECORD_EMPTY.NO_TRASH} />
            ) : (
                <>
                    <Space className="!mb-lg">
                        <Text type="secondary">
                            {RECORD_UI_TEXT.TRASH_WORK_COUNT(records.length)}
                        </Text>
                    </Space>
                    <Table
                        dataSource={sorted_records}
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

export default TrashModal;
