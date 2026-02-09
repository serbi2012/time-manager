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
import {
    RECORD_TOOLTIP,
    RECORD_CONFIRM,
    RECORD_SPACING,
} from "../../constants";

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
        <Space size={RECORD_SPACING.TINY}>
            {/* 완료/완료 취소 버튼 (가상 레코드는 불가) */}
            {!is_active &&
                (record.is_completed ? (
                    <Tooltip title={RECORD_TOOLTIP.UNCOMPLETE}>
                        <Button
                            type="text"
                            icon={<RollbackOutlined />}
                            size="small"
                            onClick={() => onUncomplete(record)}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip title={RECORD_TOOLTIP.COMPLETE}>
                        <Button
                            type="text"
                            className="!text-success"
                            icon={<CheckOutlined />}
                            size="small"
                            onClick={() => onComplete(record)}
                        />
                    </Tooltip>
                ))}

            {/* 수정 버튼 (가상 레코드도 가능) */}
            <Tooltip title={RECORD_TOOLTIP.EDIT}>
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
                    title={RECORD_CONFIRM.DELETE.TITLE}
                    description={RECORD_CONFIRM.DELETE.DESCRIPTION}
                    onConfirm={() => onDelete(record.id)}
                    okText={RECORD_CONFIRM.DELETE.OK_TEXT}
                    cancelText={RECORD_CONFIRM.DELETE.CANCEL_TEXT}
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
