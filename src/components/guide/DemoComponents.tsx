/**
 * GuideBook 전용 데모 컴포넌트들
 * - 실제 store와 완전 격리
 * - 더미 데이터만 사용
 * - 읽기 전용 (인터랙션 비활성화)
 * - 실제 UI와 최대한 동일하게 구현
 */

import {
    Table,
    Tag,
    Button,
    Card,
    Space,
    Typography,
    Tooltip,
    Empty,
    Switch,
} from "antd";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    RollbackOutlined,
    PlusOutlined,
    HolderOutlined,
    LeftOutlined,
    RightOutlined,
    ClockCircleOutlined,
    EllipsisOutlined,
    DownloadOutlined,
    UploadOutlined,
    CloudOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useShortcutStore } from "../../store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "../../hooks/useShortcuts";
import { formatDuration } from "../../shared/lib/time";

const { Text } = Typography;

// ============================================
// 더미 데이터 (완전 격리)
// ============================================

interface DemoRecord {
    id: string;
    project_code: string;
    work_name: string;
    deal_name: string;
    task_name: string;
    category_name: string;
    duration_minutes: number;
    start_time: string;
    end_time: string;
    date: string;
    is_running: boolean;
    is_completed: boolean;
}

interface DemoTemplate {
    id: string;
    work_name: string;
    deal_name: string;
    task_name: string;
    category_name: string;
    project_code: string;
    color: string;
}

const DEMO_RECORDS: DemoRecord[] = [
    {
        id: "1",
        project_code: "A25_01846",
        work_name: "5.6 프레임워크 FE",
        deal_name: "컴포넌트 개발",
        task_name: "개발",
        category_name: "개발",
        duration_minutes: 90,
        start_time: "09:00",
        end_time: "10:30",
        date: "2026-02-11",
        is_running: false,
        is_completed: false,
    },
    {
        id: "2",
        project_code: "A25_01846",
        work_name: "5.6 프레임워크 FE",
        deal_name: "API 연동 작업",
        task_name: "개발",
        category_name: "개발",
        duration_minutes: 45,
        start_time: "10:30",
        end_time: "",
        date: "2026-02-11",
        is_running: true,
        is_completed: false,
    },
    {
        id: "3",
        project_code: "A00_00000",
        work_name: "관리업무",
        deal_name: "주간회의",
        task_name: "기타",
        category_name: "회의",
        duration_minutes: 30,
        start_time: "14:00",
        end_time: "14:30",
        date: "2026-02-11",
        is_running: false,
        is_completed: true,
    },
];

const DEMO_TEMPLATES: DemoTemplate[] = [
    {
        id: "1",
        work_name: "5.6 프레임워크 FE",
        deal_name: "컴포넌트 개발",
        task_name: "개발",
        category_name: "개발",
        project_code: "A25_01846",
        color: "var(--color-primary)",
    },
    {
        id: "2",
        work_name: "5.6 프레임워크 BE",
        deal_name: "API 설계",
        task_name: "설계",
        category_name: "개발",
        color: "var(--color-success)",
    },
    {
        id: "3",
        work_name: "관리업무",
        deal_name: "주간회의",
        task_name: "기타",
        category_name: "회의",
        project_code: "A00_00000",
        color: "var(--color-warning)",
    },
];

const getCategoryColor = (category: string): string => {
    const color_map: Record<string, string> = {
        개발: "green",
        문서작업: "orange",
        회의: "purple",
        환경세팅: "cyan",
        코드리뷰: "magenta",
        테스트: "blue",
        기타: "default",
    };
    return color_map[category] || "default";
};

// ============================================
// 데모 컴포넌트들
// ============================================

/**
 * 작업 기록 테이블 데모 - 실제 UI와 동일하게 구현
 */
export function DemoWorkRecordTable() {
    const new_work_shortcut = useShortcutStore((state) =>
        state.shortcuts.find((s) => s.id === "new-work")
    );
    const new_work_keys = new_work_shortcut?.keys || "Alt+N";

    const columns: ColumnsType<DemoRecord> = [
        {
            title: "",
            key: "timer_action",
            width: 50,
            align: "center",
            render: (_, record) => (
                <Tooltip title={record.is_running ? "정지" : "시작"}>
                    <Button
                        type={record.is_running ? "primary" : "default"}
                        danger={record.is_running}
                        shape="circle"
                        size="small"
                        icon={
                            record.is_running ? (
                                <PauseCircleOutlined />
                            ) : (
                                <PlayCircleOutlined />
                            )
                        }
                    />
                </Tooltip>
            ),
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            width: 200,
            render: (text: string, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        {record.is_completed && (
                            <CheckOutlined className="text-success" />
                        )}
                        <Text
                            strong
                            className={
                                record.is_running
                                    ? "text-primary"
                                    : record.is_completed
                                    ? "text-text-disabled line-through"
                                    : undefined
                            }
                        >
                            {text || record.work_name}
                        </Text>
                        {record.is_running && (
                            <Tag color="processing" className="ml-xs">
                                00:45
                            </Tag>
                        )}
                    </Space>
                </Space>
            ),
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            width: 120,
            render: (text: string) => (
                <Tag color="blue" className="text-xs">
                    {text}
                </Tag>
            ),
        },
        {
            title: "업무명",
            dataIndex: "task_name",
            key: "task_name",
            width: 80,
            render: (text: string) =>
                text ? <Tag color="cyan">{text}</Tag> : "-",
        },
        {
            title: "카테고리",
            dataIndex: "category_name",
            key: "category_name",
            width: 90,
            render: (text: string) =>
                text ? <Tag color={getCategoryColor(text)}>{text}</Tag> : "-",
        },
        {
            title: "시간",
            key: "duration",
            width: 60,
            align: "center",
            render: (_, record) => (
                <Text
                    className={
                        record.is_running
                            ? "font-mono text-primary"
                            : "font-mono"
                    }
                >
                    {formatDuration(record.duration_minutes)}
                </Text>
            ),
        },
        {
            title: "시작-종료",
            key: "time_range",
            width: 120,
            render: (_, record) => (
                <Text type="secondary" className="text-sm">
                    {record.end_time
                        ? `${record.start_time} ~ ${record.end_time}`
                        : `${record.start_time} ~`}
                </Text>
            ),
        },
        {
            title: "날짜",
            dataIndex: "date",
            key: "date",
            width: 90,
            render: (text: string) => (
                <Text type="secondary" className="text-sm">
                    {text?.slice(5)}
                </Text>
            ),
        },
        {
            title: "",
            key: "action",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Space size={4}>
                    {!record.is_running && !record.is_completed && (
                        <Tooltip title="완료">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckOutlined />}
                                className="text-success"
                            />
                        </Tooltip>
                    )}
                    {record.is_completed && (
                        <Tooltip title="완료 취소">
                            <Button
                                type="text"
                                size="small"
                                icon={<RollbackOutlined />}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="수정">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    {!record.is_running && (
                        <Tooltip title="삭제">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="demo-component">
            <Card size="small">
                <div className="flex items-center justify-between flex-wrap gap-sm mb-md">
                    <Space>
                        <Button size="small" icon={<LeftOutlined />} disabled />
                        <Text strong>2월 11일 화요일</Text>
                        <Button
                            size="small"
                            icon={<RightOutlined />}
                            disabled
                        />
                        <Tag color="processing" className="text-xs">
                            오늘
                        </Tag>
                    </Space>
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            disabled
                        >
                            새 작업{" "}
                            <span className="text-xs opacity-85 ml-xs px-xs rounded-xs bg-white/20">
                                {formatShortcutKeyForPlatform(new_work_keys)}
                            </span>
                        </Button>
                        <Button
                            size="small"
                            icon={<EllipsisOutlined />}
                            disabled
                        />
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={DEMO_RECORDS}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    rowClassName={(record) =>
                        record.is_running
                            ? "demo-row-running"
                            : record.is_completed
                            ? "demo-row-completed"
                            : ""
                    }
                    footer={() => (
                        <Text type="secondary" className="text-sm">
                            총 {DEMO_RECORDS.length}건
                        </Text>
                    )}
                />
            </Card>
        </div>
    );
}

/**
 * 작업 프리셋 리스트 데모 - 실제 UI와 동일하게 구현
 */
export function DemoWorkTemplateList() {
    return (
        <div className="demo-component">
            <Card size="small" className="demo-template-list-card">
                <div className="flex items-center justify-between mb-md">
                    <Text strong className="text-md">
                        작업 프리셋
                    </Text>
                </div>

                <Button
                    block
                    icon={<PlusOutlined />}
                    disabled
                    className="mb-md rounded-xl"
                    style={{ borderStyle: "dashed" }}
                >
                    새 프리셋 추가
                </Button>

                <div className="demo-template-items">
                    {DEMO_TEMPLATES.map((template) => (
                        <div
                            key={template.id}
                            className="demo-template-card"
                            style={{ borderLeftColor: template.color }}
                        >
                            <div className="demo-template-drag-handle">
                                <HolderOutlined />
                            </div>

                            <div className="demo-template-content">
                                <Text
                                    strong
                                    className="demo-template-title text-md"
                                >
                                    {template.deal_name || template.work_name}
                                </Text>

                                <div className="flex items-center gap-xs flex-wrap">
                                    {template.deal_name && (
                                        <Tag
                                            className="text-xs"
                                            style={{
                                                margin: 0,
                                                padding: "0 6px",
                                                lineHeight: "18px",
                                            }}
                                        >
                                            {template.work_name}
                                        </Tag>
                                    )}
                                    {(template.task_name ||
                                        template.category_name) && (
                                        <Text
                                            type="secondary"
                                            className="text-xs"
                                        >
                                            {[
                                                template.task_name,
                                                template.category_name,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </Text>
                                    )}
                                </div>
                            </div>

                            <div className="demo-template-actions">
                                <Tooltip title="더보기">
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<EllipsisOutlined />}
                                    />
                                </Tooltip>
                                <Tooltip title="작업 추가">
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<PlusOutlined />}
                                        className="text-primary"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

/**
 * 간트차트 데모 (간소화된 버전)
 */
export function DemoDailyGanttChart() {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    const total_minutes = DEMO_RECORDS.reduce(
        (sum, r) => sum + r.duration_minutes,
        0
    );

    return (
        <div className="demo-component">
            <Card size="small">
                <div className="flex items-center justify-between mb-md">
                    <Space>
                        <Text strong className="text-md">
                            일간 타임라인
                        </Text>
                        <Button size="small" icon={<LeftOutlined />} disabled />
                        <Text type="secondary" className="text-sm">
                            2026년 2월 11일 (화)
                        </Text>
                        <Button
                            size="small"
                            icon={<RightOutlined />}
                            disabled
                        />
                    </Space>
                    <Space>
                        <Tag icon={<ClockCircleOutlined />} color="processing">
                            {formatDuration(total_minutes)}
                        </Tag>
                    </Space>
                </div>

                <div className="demo-gantt-container">
                    <div className="demo-gantt-header">
                        {hours.map((hour) => (
                            <div key={hour} className="demo-gantt-hour">
                                {hour}:00
                            </div>
                        ))}
                    </div>
                    <div className="demo-gantt-rows">
                        <div className="demo-gantt-row">
                            <div className="demo-gantt-label">
                                컴포넌트 개발
                            </div>
                            <div className="demo-gantt-bars">
                                <div
                                    className="demo-gantt-bar"
                                    style={{
                                        left: "0%",
                                        width: "18.75%",
                                        background: "var(--color-primary)",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="demo-gantt-row">
                            <div className="demo-gantt-label">API 연동</div>
                            <div className="demo-gantt-bars">
                                <div
                                    className="demo-gantt-bar demo-gantt-bar-running"
                                    style={{
                                        left: "18.75%",
                                        width: "12.5%",
                                        background: "var(--color-primary)",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="demo-gantt-row">
                            <div className="demo-gantt-label">주간회의</div>
                            <div className="demo-gantt-bars">
                                <div
                                    className="demo-gantt-bar"
                                    style={{
                                        left: "62.5%",
                                        width: "6.25%",
                                        background: "var(--color-warning)",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="demo-gantt-lunch"
                        style={{ left: "31.25%", width: "12.5%" }}
                    />
                </div>
                <Text type="secondary" className="text-xs mt-sm block">
                    빈 영역을 드래그하여 작업 추가
                </Text>
            </Card>
        </div>
    );
}

/**
 * 빈 상태 데모
 */
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

/**
 * 설정 패널 (데이터 관리 탭) 데모
 */
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

/**
 * 단축키 테이블 데모
 */
export function DemoShortcutsTable() {
    const shortcuts = [
        {
            key: "Alt + N",
            action: "새 작업 추가",
            category: "일반",
            enabled: true,
        },
        {
            key: "Alt + P",
            action: "새 프리셋 추가",
            category: "일반",
            enabled: true,
        },
        {
            key: "Alt + ,",
            action: "설정 열기",
            category: "일반",
            enabled: true,
        },
        {
            key: "F8",
            action: "모달 저장/추가",
            category: "일반",
            enabled: true,
        },
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

    const category_color_map: Record<string, string> = {
        일반: "blue",
        타이머: "orange",
        네비게이션: "green",
        데이터: "purple",
    };

    const columns: ColumnsType<(typeof shortcuts)[0]> = [
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
                <Tag color={category_color_map[t] || "default"}>{t}</Tag>
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
                    dataSource={shortcuts}
                    rowKey="key"
                    size="small"
                    pagination={false}
                />
            </Card>
        </div>
    );
}

// ============================================
// 데모 컴포넌트 레지스트리
// ============================================

// eslint-disable-next-line react-refresh/only-export-components -- 데모 레지스트리
export const DEMO_COMPONENTS: Record<string, React.ComponentType> = {
    WorkRecordTable: DemoWorkRecordTable,
    WorkTemplateList: DemoWorkTemplateList,
    DailyGanttChart: DemoDailyGanttChart,
    EmptyState: DemoEmptyState,
    ShortcutsTable: DemoShortcutsTable,
    SettingsPanel: DemoSettingsPanel,
};

/**
 * 데모 컴포넌트 렌더러
 */
export function DemoRenderer({ componentName }: { componentName: string }) {
    const Component = DEMO_COMPONENTS[componentName];

    if (!Component) {
        return (
            <div className="demo-not-found">
                <Text type="secondary">
                    데모 컴포넌트를 찾을 수 없습니다: {componentName}
                </Text>
            </div>
        );
    }

    return (
        <div className="demo-wrapper">
            <div className="demo-badge">실제 UI 미리보기</div>
            <Component />
        </div>
    );
}
