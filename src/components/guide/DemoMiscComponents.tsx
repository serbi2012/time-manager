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

const { Text } = Typography;

export function DemoEmptyState() {
    return (
        <div className="demo-component">
            <Card size="small" title="작업 프리셋">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div className="flex flex-col items-center gap-xs">
                            <Text strong>아직 프리셋이 없어요</Text>
                            <Text type="secondary" className="text-sm">
                                자주 쓰는 작업을 저장해 보세요
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
            <Card size="small" title="데이터">
                <div className="mb-lg">
                    <Text strong className="block mb-sm">
                        시간 설정
                    </Text>
                    <div className="flex justify-between items-center p-sm bg-bg-light rounded-md">
                        <div>
                            <Text>점심시간</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                                간트차트에 표시되며 작업 시간 계산 시 자동
                                제외돼요
                            </Text>
                        </div>
                        <Tag>11:40 ~ 12:40</Tag>
                    </div>
                </div>

                <div className="mb-lg">
                    <Text strong className="block mb-sm">
                        프리셋 설정
                    </Text>
                    <div className="flex justify-between items-center p-sm bg-bg-light rounded-md">
                        <div>
                            <Text>고유 식별자 자동 추가</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                                프리셋으로 작업 추가 시 거래명에 타임스탬프를
                                붙여요
                            </Text>
                        </div>
                        <Switch size="small" disabled />
                    </div>
                </div>

                <div className="mb-lg">
                    <Text strong className="block mb-sm">
                        데이터 관리
                    </Text>
                    <Space direction="vertical" className="w-full" size="small">
                        <Button
                            icon={<DownloadOutlined />}
                            block
                            disabled
                            className="text-left"
                        >
                            데이터 내보내기
                        </Button>
                        <Button
                            icon={<UploadOutlined />}
                            block
                            disabled
                            className="text-left"
                        >
                            데이터 가져오기
                        </Button>
                        <Text type="secondary" className="text-sm">
                            JSON 파일로 데이터를 백업하거나 복원할 수 있어요.
                            가져오기 시 기존 데이터가 대체돼요.
                        </Text>
                    </Space>
                </div>

                <div>
                    <Text strong className="block mb-sm">
                        저장소
                    </Text>
                    <div className="flex justify-between items-center p-sm bg-bg-light rounded-md">
                        <Space>
                            <CloudOutlined className="text-success" />
                            <Text>클라우드 연결됨</Text>
                        </Space>
                    </div>
                    <Text type="secondary" className="text-sm mt-xs block">
                        모든 데이터가 자동으로 동기화돼요
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
    { key: "Alt + N", action: "새 작업 추가", category: "일반", enabled: true },
    {
        key: "Alt + P",
        action: "새 프리셋 추가",
        category: "일반",
        enabled: true,
    },
    { key: "Alt + ,", action: "설정 열기", category: "일반", enabled: true },
    { key: "F8", action: "모달 저장/추가", category: "일반", enabled: true },
    {
        key: "Alt + S",
        action: "타이머 시작/중지",
        category: "타이머",
        enabled: true,
    },
    {
        key: "Alt + R",
        action: "타이머 초기화",
        category: "타이머",
        enabled: true,
    },
    {
        key: "Alt + T",
        action: "오늘로 이동",
        category: "네비게이션",
        enabled: true,
    },
    {
        key: "Alt + ←",
        action: "이전 날짜",
        category: "네비게이션",
        enabled: true,
    },
    {
        key: "Alt + →",
        action: "다음 날짜",
        category: "네비게이션",
        enabled: true,
    },
    {
        key: "Alt + 1",
        action: "일간 기록 페이지",
        category: "네비게이션",
        enabled: true,
    },
    {
        key: "Alt + 2",
        action: "주간 일정 페이지",
        category: "네비게이션",
        enabled: true,
    },
    {
        key: "Alt + E",
        action: "데이터 내보내기",
        category: "데이터",
        enabled: true,
    },
    {
        key: "Alt + Shift + S",
        action: "수동 동기화",
        category: "데이터",
        enabled: true,
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    일반: "blue",
    타이머: "orange",
    네비게이션: "green",
    데이터: "purple",
};

export function DemoShortcutsTable() {
    const columns: ColumnsType<ShortcutItem> = [
        {
            title: "기능",
            dataIndex: "action",
            key: "action",
        },
        {
            title: "단축키",
            dataIndex: "key",
            key: "key",
            width: 140,
            render: (t) => (
                <Tag className="font-mono text-sm px-sm py-xs">{t}</Tag>
            ),
        },
        {
            title: "카테고리",
            dataIndex: "category",
            key: "category",
            width: 100,
            render: (t) => (
                <Tag color={CATEGORY_COLORS[t] || "default"}>{t}</Tag>
            ),
        },
        {
            title: "활성화",
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
            <Card size="small" title="단축키 목록">
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
