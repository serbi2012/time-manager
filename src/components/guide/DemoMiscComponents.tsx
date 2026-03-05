/**
 * 소형 데모 컴포넌트들 (빈 상태, 설정 패널, 단축키 테이블)
 */

import {
    Table,
    Tag,
    Button,
    Card,
    Space,
    Typography,
    Empty,
    Switch,
} from "antd";
import {
    DownloadOutlined,
    UploadOutlined,
    CloudOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    ShortcutCategory,
    SHORTCUT_CATEGORY_LABELS,
} from "@/shared/constants";
import { DEMO_MISC_LABELS } from "@/features/guide/constants";

const { Text } = Typography;

export function DemoEmptyState() {
    return (
        <div className="demo-component">
            <Card size="small" title={DEMO_MISC_LABELS.presetTitle}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div className="flex flex-col items-center gap-xs">
                            <Text strong>{DEMO_MISC_LABELS.emptyPreset}</Text>
                            <Text type="secondary" className="text-sm">
                                {DEMO_MISC_LABELS.emptyPresetDesc}
                            </Text>
                        </div>
                    }
                />
            </Card>
        </div>
    );
}

export function DemoSettingsPanel() {
    return (
        <div className="demo-component">
            <Card size="small" title={DEMO_MISC_LABELS.dataTab}>
                <div className="mb-lg">
                    <Text strong className="block mb-sm">
                        {DEMO_MISC_LABELS.timeSetting}
                    </Text>
                    <div className="flex justify-between items-center p-sm bg-bg-light rounded-md">
                        <div>
                            <Text>{DEMO_MISC_LABELS.lunchTime}</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                                {DEMO_MISC_LABELS.lunchTimeDesc}
                            </Text>
                        </div>
                        <Tag>11:40 ~ 12:40</Tag>
                    </div>
                </div>

                <div className="mb-lg">
                    <Text strong className="block mb-sm">
                        {DEMO_MISC_LABELS.presetSetting}
                    </Text>
                    <div className="flex justify-between items-center p-sm bg-bg-light rounded-md">
                        <div>
                            <Text>{DEMO_MISC_LABELS.autoIdentifier}</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                                {DEMO_MISC_LABELS.autoIdentifierDesc}
                            </Text>
                        </div>
                        <Switch size="small" disabled />
                    </div>
                </div>

                <div className="mb-lg">
                    <Text strong className="block mb-sm">
                        {DEMO_MISC_LABELS.dataManagement}
                    </Text>
                    <Space direction="vertical" className="w-full" size="small">
                        <Button
                            icon={<DownloadOutlined />}
                            block
                            disabled
                            className="text-left"
                        >
                            {DEMO_MISC_LABELS.exportData}
                        </Button>
                        <Button
                            icon={<UploadOutlined />}
                            block
                            disabled
                            className="text-left"
                        >
                            {DEMO_MISC_LABELS.importData}
                        </Button>
                        <Text type="secondary" className="text-sm">
                            {DEMO_MISC_LABELS.dataManagementDesc}
                        </Text>
                    </Space>
                </div>

                <div>
                    <Text strong className="block mb-sm">
                        {DEMO_MISC_LABELS.storage}
                    </Text>
                    <div className="flex justify-between items-center p-sm bg-bg-light rounded-md">
                        <Space>
                            <CloudOutlined className="text-success" />
                            <Text>{DEMO_MISC_LABELS.cloudConnected}</Text>
                        </Space>
                    </div>
                    <Text type="secondary" className="text-sm mt-xs block">
                        {DEMO_MISC_LABELS.cloudSyncDesc}
                    </Text>
                </div>
            </Card>
        </div>
    );
}

interface ShortcutItem {
    key: string;
    action: string;
    category: string;
    enabled: boolean;
}

const DEMO_SHORTCUTS: ShortcutItem[] = [
    {
        key: "Alt + N",
        action: "새 작업 추가",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.General],
        enabled: true,
    },
    {
        key: "Alt + P",
        action: "새 프리셋 추가",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.General],
        enabled: true,
    },
    {
        key: "Alt + ,",
        action: "설정 열기",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.General],
        enabled: true,
    },
    {
        key: "F8",
        action: "모달 저장/추가",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.General],
        enabled: true,
    },
    {
        key: "Alt + S",
        action: "타이머 시작/중지",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Timer],
        enabled: true,
    },
    {
        key: "Alt + R",
        action: "타이머 초기화",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Timer],
        enabled: true,
    },
    {
        key: "Alt + T",
        action: "오늘로 이동",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Navigation],
        enabled: true,
    },
    {
        key: "Alt + ←",
        action: "이전 날짜",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Navigation],
        enabled: true,
    },
    {
        key: "Alt + →",
        action: "다음 날짜",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Navigation],
        enabled: true,
    },
    {
        key: "Alt + 1",
        action: "일간 기록 페이지",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Navigation],
        enabled: true,
    },
    {
        key: "Alt + 2",
        action: "주간 일정 페이지",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Navigation],
        enabled: true,
    },
    {
        key: "Alt + E",
        action: "데이터 내보내기",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Data],
        enabled: true,
    },
    {
        key: "Alt + Shift + S",
        action: "수동 동기화",
        category: SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Data],
        enabled: true,
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    [SHORTCUT_CATEGORY_LABELS[ShortcutCategory.General]]: "blue",
    [SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Timer]]: "orange",
    [SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Navigation]]: "green",
    [SHORTCUT_CATEGORY_LABELS[ShortcutCategory.Data]]: "purple",
};

export function DemoShortcutsTable() {
    const columns: ColumnsType<ShortcutItem> = [
        {
            title: DEMO_MISC_LABELS.feature,
            dataIndex: "action",
            key: "action",
        },
        {
            title: DEMO_MISC_LABELS.shortcut,
            dataIndex: "key",
            key: "key",
            width: 140,
            render: (t) => (
                <Tag className="font-mono text-sm px-sm py-xs">{t}</Tag>
            ),
        },
        {
            title: DEMO_MISC_LABELS.category,
            dataIndex: "category",
            key: "category",
            width: 100,
            render: (t) => (
                <Tag color={CATEGORY_COLORS[t] || "default"}>{t}</Tag>
            ),
        },
        {
            title: DEMO_MISC_LABELS.enabled,
            dataIndex: "enabled",
            key: "enabled",
            width: 80,
            align: "center",
            render: (enabled: boolean) => (
                <Switch size="small" checked={enabled} disabled />
            ),
        },
    ];

    return (
        <div className="demo-component">
            <Card size="small" title={DEMO_MISC_LABELS.shortcutList}>
                <Table
                    columns={columns}
                    dataSource={DEMO_SHORTCUTS}
                    rowKey="key"
                    size="small"
                    pagination={false}
                />
            </Card>
        </div>
    );
}
