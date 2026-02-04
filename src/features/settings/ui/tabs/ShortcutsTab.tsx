/**
 * 단축키 탭 컴포넌트
 */

import { useState } from "react";
import {
    Table,
    Switch,
    Button,
    Typography,
    Tag,
    Space,
    Popconfirm,
} from "antd";
import { EditOutlined, ReloadOutlined, KeyOutlined } from "@ant-design/icons";
import { useShortcutStore } from "@/store/useShortcutStore";
import type { ShortcutDefinition } from "@/store/useShortcutStore";
import { useWorkStore } from "@/store/useWorkStore";
import { APP_THEME_COLORS } from "@/store/constants";
import { formatShortcutKeyForPlatform } from "@/hooks/useShortcuts";
import { message } from "antd";
import { SUCCESS_MESSAGES } from "@/shared/constants/ui/messages";
import {
    SETTINGS_SHORTCUTS_DESC,
    SETTINGS_SHORTCUTS_RESET,
    SETTINGS_SHORTCUTS_RESET_CONFIRM_TITLE,
    SETTINGS_SHORTCUTS_RESET_CONFIRM_DESC,
    SETTINGS_SHORTCUTS_RESET_OK,
    SETTINGS_SHORTCUTS_COLUMN_FUNCTION,
    SETTINGS_SHORTCUTS_COLUMN_KEYS,
    SETTINGS_SHORTCUTS_COLUMN_CATEGORY,
    SETTINGS_SHORTCUTS_COLUMN_ENABLED,
    SETTINGS_SHORTCUTS_PC_ONLY_TITLE,
    SETTINGS_SHORTCUTS_PC_ONLY_DESC,
    SETTINGS_CANCEL,
} from "../../constants";
import { ShortcutKeyEditor } from "./ShortcutKeyEditor";

const { Text } = Typography;

const CATEGORY_LABELS: Record<string, string> = {
    general: "일반",
    timer: "타이머",
    navigation: "네비게이션",
    data: "데이터",
    modal: "모달",
};

const HEADER_ROW_STYLE: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
};

const MOBILE_OVERLAY_WRAPPER: React.CSSProperties = {
    position: "relative",
};

const MOBILE_BLUR_STYLE: React.CSSProperties = {
    filter: "blur(3px)",
    opacity: 0.5,
    pointerEvents: "none",
    userSelect: "none",
};

const MOBILE_PREVIEW_LIST: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const MOBILE_PREVIEW_ITEM: React.CSSProperties = {
    padding: 12,
    background: "#fafafa",
    borderRadius: 8,
    border: "1px solid #f0f0f0",
};

const MOBILE_OVERLAY_BOX: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.85)",
    borderRadius: 8,
    padding: 24,
    textAlign: "center",
};

const KEY_ICON_STYLE: React.CSSProperties = {
    fontSize: 40,
    color: "#bfbfbf",
    marginBottom: 16,
};

const PC_ONLY_TITLE_STYLE: React.CSSProperties = {
    fontSize: 16,
    marginBottom: 8,
    color: "#595959",
};

const TAG_MONOSPACE: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: 13,
    padding: "4px 8px",
};

export interface ShortcutsTabProps {
    is_mobile?: boolean;
}

export function ShortcutsTab({ is_mobile }: ShortcutsTabProps) {
    const shortcuts = useShortcutStore((state) => state.shortcuts);
    const toggleShortcut = useShortcutStore((state) => state.toggleShortcut);
    const resetToDefault = useShortcutStore((state) => state.resetToDefault);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    const [editing_shortcut, setEditingShortcut] =
        useState<ShortcutDefinition | null>(null);

    const columns = [
        {
            title: SETTINGS_SHORTCUTS_COLUMN_FUNCTION,
            dataIndex: "name",
            key: "name",
            render: (name: string, record: ShortcutDefinition) => (
                <div>
                    <Text strong>{name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.description}
                    </Text>
                </div>
            ),
        },
        {
            title: SETTINGS_SHORTCUTS_COLUMN_KEYS,
            dataIndex: "keys",
            key: "keys",
            width: 150,
            render: (keys: string, record: ShortcutDefinition) => (
                <Space>
                    <Tag style={TAG_MONOSPACE}>
                        {formatShortcutKeyForPlatform(keys)}
                    </Tag>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditingShortcut(record)}
                    />
                </Space>
            ),
        },
        {
            title: SETTINGS_SHORTCUTS_COLUMN_CATEGORY,
            dataIndex: "category",
            key: "category",
            width: 100,
            render: (category: ShortcutDefinition["category"]) => (
                <Tag color={theme_color}>
                    {CATEGORY_LABELS[category] ?? category}
                </Tag>
            ),
        },
        {
            title: SETTINGS_SHORTCUTS_COLUMN_ENABLED,
            dataIndex: "enabled",
            key: "enabled",
            width: 80,
            render: (enabled: boolean, record: ShortcutDefinition) => (
                <Switch
                    checked={enabled}
                    onChange={() => toggleShortcut(record.id)}
                    size="small"
                />
            ),
        },
    ];

    const handleReset = () => {
        resetToDefault();
        message.success(SUCCESS_MESSAGES.shortcutResetDone);
    };

    if (is_mobile) {
        return (
            <div style={MOBILE_OVERLAY_WRAPPER}>
                <div style={MOBILE_BLUR_STYLE}>
                    <div style={MOBILE_PREVIEW_LIST}>
                        {shortcuts.slice(0, 3).map((shortcut) => (
                            <div key={shortcut.id} style={MOBILE_PREVIEW_ITEM}>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 13,
                                        display: "block",
                                    }}
                                >
                                    {shortcut.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    {shortcut.description}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={MOBILE_OVERLAY_BOX}>
                    <KeyOutlined style={KEY_ICON_STYLE} />
                    <Text strong style={PC_ONLY_TITLE_STYLE}>
                        {SETTINGS_SHORTCUTS_PC_ONLY_TITLE}
                    </Text>
                    <Text
                        type="secondary"
                        style={{ fontSize: 13, lineHeight: 1.5 }}
                    >
                        {SETTINGS_SHORTCUTS_PC_ONLY_DESC}
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={HEADER_ROW_STYLE}>
                <Text type="secondary">{SETTINGS_SHORTCUTS_DESC}</Text>
                <Popconfirm
                    title={SETTINGS_SHORTCUTS_RESET_CONFIRM_TITLE}
                    description={SETTINGS_SHORTCUTS_RESET_CONFIRM_DESC}
                    onConfirm={handleReset}
                    okText={SETTINGS_SHORTCUTS_RESET_OK}
                    cancelText={SETTINGS_CANCEL}
                    okButtonProps={{ autoFocus: true }}
                >
                    <Button icon={<ReloadOutlined />} size="small">
                        {SETTINGS_SHORTCUTS_RESET}
                    </Button>
                </Popconfirm>
            </div>
            <Table
                dataSource={shortcuts}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ marginTop: 8 }}
            />
            {editing_shortcut && (
                <ShortcutKeyEditor
                    shortcut={editing_shortcut}
                    onClose={() => setEditingShortcut(null)}
                />
            )}
        </div>
    );
}

export default ShortcutsTab;
