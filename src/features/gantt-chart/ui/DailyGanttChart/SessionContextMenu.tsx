/**
 * 간트 바 우클릭 컨텍스트 메뉴 (Popover content)
 */

import { Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
    GANTT_CONTEXT_MENU_MIN_WIDTH,
    GANTT_CONTEXT_MENU_HEADER_MARGIN_BOTTOM,
    GANTT_CONTEXT_MENU_TIME_MARGIN_TOP,
    GANTT_TEXT_SECONDARY,
    GANTT_TEXT_TERTIARY,
    GANTT_FONT_SMALL,
    GANTT_LABEL_EDIT_WORK,
    GANTT_LABEL_DELETE_SESSION,
    GANTT_LABEL_DELETE_SESSION_TITLE,
    GANTT_LABEL_DELETE_SESSION_DESC,
} from "../../constants";
import type { WorkRecord, WorkSession } from "../../../../shared/types";

export interface SessionContextMenuProps {
    record: WorkRecord;
    session: WorkSession;
    is_running: boolean;
    on_edit: () => void;
    on_delete: () => void;
}

const WRAPPER_STYLE: React.CSSProperties = {
    minWidth: GANTT_CONTEXT_MENU_MIN_WIDTH,
};

const HEADER_STYLE: React.CSSProperties = {
    marginBottom: GANTT_CONTEXT_MENU_HEADER_MARGIN_BOTTOM,
};

const TIME_STYLE: React.CSSProperties = {
    color: GANTT_TEXT_TERTIARY,
    fontSize: GANTT_FONT_SMALL,
    marginTop: GANTT_CONTEXT_MENU_TIME_MARGIN_TOP,
};

const DEAL_NAME_STYLE: React.CSSProperties = {
    color: GANTT_TEXT_SECONDARY,
    fontSize: GANTT_FONT_SMALL,
};

const BUTTON_STYLE: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
};

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
        <div style={WRAPPER_STYLE}>
            <div style={HEADER_STYLE}>
                <strong>{record.work_name}</strong>
                {record.deal_name && (
                    <div style={DEAL_NAME_STYLE}>{record.deal_name}</div>
                )}
                <div style={TIME_STYLE}>
                    {session.start_time} ~ {session.end_time}
                </div>
            </div>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={on_edit}
                    style={BUTTON_STYLE}
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
                    okText="삭제"
                    cancelText="취소"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        style={BUTTON_STYLE}
                        disabled={is_running}
                    >
                        {GANTT_LABEL_DELETE_SESSION}
                    </Button>
                </Popconfirm>
            </Space>
        </div>
    );
}
