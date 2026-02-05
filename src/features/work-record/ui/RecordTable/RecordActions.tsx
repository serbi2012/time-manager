/**
 * 레코드 액션 버튼 컴포넌트
 */

import { Button, Space, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CopyOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import type { RecordActionsProps } from "../../lib/types";
import { RECORD_BUTTON, RECORD_TOOLTIP } from "../../constants";

/**
 * 레코드 액션 버튼 컴포넌트
 * 데스크톱: 버튼 그룹으로 표시
 * 모바일: 드롭다운 메뉴로 표시
 */
export function RecordActions({
    record,
    is_running,
    on_start,
    on_stop,
    on_edit,
    on_delete,
    on_complete,
    on_copy,
}: RecordActionsProps) {
    const menu_items: MenuProps["items"] = [
        {
            key: "edit",
            icon: <EditOutlined />,
            label: RECORD_BUTTON.EDIT,
            onClick: on_edit,
        },
        {
            key: "copy",
            icon: <CopyOutlined />,
            label: RECORD_BUTTON.COPY,
            onClick: on_copy,
        },
        {
            key: "complete",
            icon: <CheckOutlined />,
            label: record.is_completed
                ? RECORD_TOOLTIP.UNCOMPLETE
                : RECORD_BUTTON.COMPLETE,
            onClick: on_complete,
        },
        { type: "divider" },
        {
            key: "delete",
            icon: <DeleteOutlined />,
            label: RECORD_BUTTON.DELETE,
            danger: true,
            onClick: on_delete,
        },
    ];

    return (
        <Space size="small">
            {/* 타이머 버튼 */}
            {is_running ? (
                <Tooltip title={RECORD_TOOLTIP.STOP_TIMER}>
                    <Button
                        type="primary"
                        danger
                        icon={<PauseCircleOutlined />}
                        onClick={on_stop}
                        size="small"
                    />
                </Tooltip>
            ) : (
                <Tooltip title={RECORD_TOOLTIP.START_TIMER}>
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={on_start}
                        size="small"
                        disabled={record.is_completed}
                    />
                </Tooltip>
            )}

            {/* 더보기 드롭다운 */}
            <Dropdown menu={{ items: menu_items }} trigger={["click"]}>
                <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
        </Space>
    );
}

export default RecordActions;
