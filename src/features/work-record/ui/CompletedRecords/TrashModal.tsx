/**
 * 휴지통 모달 컴포넌트
 */

import { Modal, Table, Button, Empty, Typography, Popconfirm, Space } from "antd";
import { RollbackOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TrashModalProps } from "../../lib/types";
import type { WorkRecord } from "../../../../shared/types";
import { formatDuration } from "../../../../shared/lib/time";

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
            title: "소요 시간",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            render: (mins: number) => formatDuration(mins),
        },
        {
            title: "삭제 일시",
            dataIndex: "deleted_at",
            key: "deleted_at",
            render: (date: string) =>
                date ? new Date(date).toLocaleString("ko-KR") : "-",
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
                        복원
                    </Button>
                    <Popconfirm
                        title="영구 삭제"
                        description="이 작업을 영구 삭제하시겠습니까? 복구할 수 없습니다."
                        onConfirm={() => on_permanent_delete(record)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Modal
            title="휴지통"
            open={open}
            onCancel={on_close}
            footer={null}
            width={800}
        >
            {records.length === 0 ? (
                <Empty description="휴지통이 비어있습니다." />
            ) : (
                <>
                    <Space style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                            {records.length}개의 삭제된 작업
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
