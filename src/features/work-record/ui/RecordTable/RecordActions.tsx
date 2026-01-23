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
            label: "수정",
            onClick: on_edit,
        },
        {
            key: "copy",
            icon: <CopyOutlined />,
            label: "복사",
            onClick: on_copy,
        },
        {
            key: "complete",
            icon: <CheckOutlined />,
            label: record.is_completed ? "완료 취소" : "완료",
            onClick: on_complete,
        },
        { type: "divider" },
        {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "삭제",
            danger: true,
            onClick: on_delete,
        },
    ];

    return (
        <Space size="small">
            {/* 타이머 버튼 */}
            {is_running ? (
                <Tooltip title="타이머 정지">
                    <Button
                        type="primary"
                        danger
                        icon={<PauseCircleOutlined />}
                        onClick={on_stop}
                        size="small"
                    />
                </Tooltip>
            ) : (
                <Tooltip title="타이머 시작">
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
                <Button
                    type="text"
                    icon={<MoreOutlined />}
                    size="small"
                />
            </Dropdown>
        </Space>
    );
}

export default RecordActions;
