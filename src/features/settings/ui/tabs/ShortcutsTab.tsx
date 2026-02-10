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
import { message } from "@/shared/lib/message";
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
                    <Text type="secondary" className="!text-xs">
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
                    <Tag className="!font-mono !text-[13px] !py-xs !px-sm">
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
            <div className="relative">
                <div className="blur-sm opacity-50 pointer-events-none select-none">
                    <div className="flex flex-col gap-sm">
                        {shortcuts.slice(0, 3).map((shortcut) => (
                            <div
                                key={shortcut.id}
                                className="p-md bg-[#fafafa] rounded-lg border border-[#f0f0f0]"
                            >
                                <Text strong className="!text-[13px] !block">
                                    {shortcut.name}
                                </Text>
                                <Text type="secondary" className="!text-[11px]">
                                    {shortcut.description}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 rounded-lg p-xl text-center">
                    <KeyOutlined className="!text-[40px] !text-[#bfbfbf] !mb-lg" />
                    <Text strong className="!text-base !mb-sm !text-[#595959]">
                        {SETTINGS_SHORTCUTS_PC_ONLY_TITLE}
                    </Text>
                    <Text
                        type="secondary"
                        className="!text-[13px] !leading-[1.5]"
                    >
                        {SETTINGS_SHORTCUTS_PC_ONLY_DESC}
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
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
                className="!mt-sm"
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
