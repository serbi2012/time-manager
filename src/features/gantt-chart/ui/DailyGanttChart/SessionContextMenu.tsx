/**
 * 간트 바 우클릭 컨텍스트 메뉴 (Popover content)
 */

import { Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
    GANTT_LABEL_EDIT_WORK,
    GANTT_LABEL_DELETE_SESSION,
    GANTT_LABEL_DELETE_SESSION_TITLE,
    GANTT_LABEL_DELETE_SESSION_DESC,
    GANTT_BUTTON_DELETE,
    GANTT_BUTTON_CANCEL,
} from "../../constants";
import type { WorkRecord, WorkSession } from "../../../../shared/types";

export interface SessionContextMenuProps {
    record: WorkRecord;
    session: WorkSession;
    is_running: boolean;
    on_edit: () => void;
    on_delete: () => void;
}

/**
 * 세션 우클릭 시 표시되는 컨텍스트 메뉴
 */
export function SessionContextMenu({
    record,
    session,
    is_running,
    on_edit,
    on_delete,
}: SessionContextMenuProps) {
    return (
        <div className="min-w-[160px]">
            <div className="mb-sm">
                <strong>{record.work_name}</strong>
                {record.deal_name && (
                    <div className="text-text-secondary text-sm">
                        {record.deal_name}
                    </div>
                )}
                <div className="text-text-disabled text-sm mt-xs">
                    {session.start_time} ~ {session.end_time}
                </div>
            </div>
            <Space direction="vertical" className="!w-full">
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={on_edit}
                    className="!w-full !text-left"
                >
                    {GANTT_LABEL_EDIT_WORK}
                </Button>
                <Popconfirm
                    title={GANTT_LABEL_DELETE_SESSION_TITLE}
                    description={GANTT_LABEL_DELETE_SESSION_DESC(
                        session.start_time,
                        session.end_time
                    )}
                    onConfirm={on_delete}
                    okText={GANTT_BUTTON_DELETE}
                    cancelText={GANTT_BUTTON_CANCEL}
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="!w-full !text-left"
                        disabled={is_running}
                    >
                        {GANTT_LABEL_DELETE_SESSION}
                    </Button>
                </Popconfirm>
            </Space>
        </div>
    );
}
