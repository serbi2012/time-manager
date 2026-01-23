/**
 * 단축키 탭 컴포넌트
 */

import { Table, Switch, Button, Typography, Tag, Space } from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ShortcutsTabProps } from "../../model/types";
import type { ShortcutDefinition } from "../../../../shared/types";

const { Text } = Typography;

/**
 * 단축키 카테고리 라벨
 */
const CATEGORY_LABELS: Record<string, string> = {
    general: "일반",
    timer: "타이머",
    navigation: "네비게이션",
    data: "데이터",
    modal: "모달",
};

/**
 * 단축키 탭 컴포넌트
 */
export function ShortcutsTab({
    shortcuts,
    on_toggle,
    on_edit,
    on_reset,
}: ShortcutsTabProps) {
    const columns: ColumnsType<ShortcutDefinition> = [
        {
            title: "기능",
            dataIndex: "name",
            key: "name",
            render: (name: string, record) => (
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
            title: "카테고리",
            dataIndex: "category",
            key: "category",
            width: 100,
            render: (category: string) => (
                <Tag>{CATEGORY_LABELS[category] || category}</Tag>
            ),
        },
        {
            title: "단축키",
            dataIndex: "keys",
            key: "keys",
            width: 150,
            render: (keys: string, record) => (
                <Space>
                    <Tag color="blue">{keys}</Tag>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => on_edit(record)}
                    />
                </Space>
            ),
        },
        {
            title: "활성화",
            dataIndex: "enabled",
            key: "enabled",
            width: 80,
            render: (enabled: boolean, record) => (
                <Switch
                    checked={enabled}
                    onChange={() => on_toggle(record.id)}
                    size="small"
                />
            ),
        },
    ];

    return (
        <div className="shortcuts-tab">
            <div style={{ marginBottom: 16 }}>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={on_reset}
                >
                    기본값으로 초기화
                </Button>
            </div>

            <Table
                dataSource={shortcuts}
                columns={columns}
                rowKey="id"
                size="small"
                pagination={false}
            />

            <style>{`
                .shortcuts-tab {
                    padding: 16px 0;
                }
            `}</style>
        </div>
    );
}

export default ShortcutsTab;
