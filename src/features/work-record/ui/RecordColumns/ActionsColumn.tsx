/**
 * 액션 버튼 컬럼 (완료/수정/삭제)
 */

import { Space, Button, Tooltip, Popconfirm } from "antd";
import {
    CheckOutlined,
    EditOutlined,
    DeleteOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";

interface ActionsColumnProps {
    record: WorkRecord;
    is_active: boolean;
    onComplete: (record: WorkRecord) => void;
    onUncomplete: (record: WorkRecord) => void;
    onEdit: (record: WorkRecord) => void;
    onDelete: (record_id: string) => void;
}

export function ActionsColumn({
    record,
    is_active,
    onComplete,
    onUncomplete,
    onEdit,
    onDelete,
}: ActionsColumnProps) {
    return (
        <Space size={4}>
            {/* 완료/완료 취소 버튼 (가상 레코드는 불가) */}
            {!is_active &&
                (record.is_completed ? (
                    <Tooltip title="완료 취소">
                        <Button
                            type="text"
                            icon={<RollbackOutlined />}
                            size="small"
                            onClick={() => onUncomplete(record)}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip title="완료">
                        <Button
                            type="text"
                            style={{ color: "#52c41a" }}
                            icon={<CheckOutlined />}
                            size="small"
                            onClick={() => onComplete(record)}
                        />
                    </Tooltip>
                ))}

            {/* 수정 버튼 (가상 레코드도 가능) */}
            <Tooltip title="수정">
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => onEdit(record)}
                />
            </Tooltip>

            {/* 삭제 버튼 (가상 레코드는 불가) */}
            {!is_active && (
                <Popconfirm
                    title="삭제 확인"
                    description="이 기록을 휴지통으로 이동하시겠습니까?"
                    onConfirm={() => onDelete(record.id)}
                    okText="삭제"
                    cancelText="취소"
                    okButtonProps={{
                        danger: true,
                        autoFocus: true,
                    }}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    />
                </Popconfirm>
            )}
        </Space>
    );
}
