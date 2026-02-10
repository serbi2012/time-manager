/**
 * Actions column (hover-only visible, Toss style)
 * 2-4: Hover scale on action buttons
 * 5-1: Press scale
 */

import { Tooltip, Popconfirm } from "antd";
import {
    CheckOutlined,
    EditOutlined,
    DeleteOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import { RECORD_TOOLTIP, RECORD_CONFIRM } from "../../constants";
import { motion } from "../../../../shared/ui/animation";

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
        <div className="record-row-actions flex items-center gap-xs">
            {/* Complete / Uncomplete */}
            {!is_active &&
                (record.is_completed ? (
                    <Tooltip title={RECORD_TOOLTIP.UNCOMPLETE}>
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-bg-grey hover:text-primary transition-colors"
                            onClick={() => onUncomplete(record)}
                        >
                            <RollbackOutlined style={{ fontSize: 14 }} />
                        </motion.button>
                    </Tooltip>
                ) : (
                    <Tooltip title={RECORD_TOOLTIP.COMPLETE}>
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-success hover:bg-green-50 transition-colors"
                            onClick={() => onComplete(record)}
                        >
                            <CheckOutlined style={{ fontSize: 14 }} />
                        </motion.button>
                    </Tooltip>
                ))}

            {/* Edit */}
            <Tooltip title={RECORD_TOOLTIP.EDIT}>
                <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-bg-grey hover:text-primary transition-colors"
                    onClick={() => onEdit(record)}
                >
                    <EditOutlined style={{ fontSize: 14 }} />
                </motion.button>
            </Tooltip>

            {/* Delete */}
            {!is_active && (
                <Popconfirm
                    title={RECORD_CONFIRM.DELETE.TITLE}
                    description={RECORD_CONFIRM.DELETE.DESCRIPTION}
                    onConfirm={() => onDelete(record.id)}
                    okText={RECORD_CONFIRM.DELETE.OK_TEXT}
                    cancelText={RECORD_CONFIRM.DELETE.CANCEL_TEXT}
                    okButtonProps={{ danger: true, autoFocus: true }}
                >
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-error transition-colors"
                    >
                        <DeleteOutlined style={{ fontSize: 14 }} />
                    </motion.button>
                </Popconfirm>
            )}
        </div>
    );
}
