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
    DatePicker,
    Statistic,
    Row,
    Col,
    Empty,
} from "antd";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    FolderOutlined,
    HolderOutlined,
    CopyOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

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
    is_running: boolean;
    is_completed: boolean;
}

interface DemoTemplate {
    id: string;
    work_name: string;
    deal_name: string;
    task_name: string;
    category_name: string;
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
        color: "#1890ff",
    },
    {
        id: "2",
        work_name: "5.6 프레임워크 BE",
        deal_name: "API 설계",
        task_name: "설계",
        category_name: "개발",
        color: "#52c41a",
    },
    {
        id: "3",
        work_name: "관리업무",
        deal_name: "주간회의",
        task_name: "기타",
        category_name: "회의",
        color: "#faad14",
    },
];

// 카테고리별 색상 매핑
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

// 분을 읽기 쉬운 형식으로 변환
const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes}분`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hrs}시간`;
    }
    return `${hrs}시간 ${mins}분`;
};

// ============================================
// 데모 컴포넌트들
// ============================================

/**
 * 작업 기록 테이블 데모 - 실제 UI와 동일하게 구현
 */
export function DemoWorkRecordTable() {
    const today = dayjs();
    const total_minutes = DEMO_RECORDS.reduce(
        (sum, r) => sum + r.duration_minutes,
        0
    );

    const columns: ColumnsType<DemoRecord> = [
        {
            title: "",
            key: "timer_action",
            width: 50,
            align: "center",
            render: (_, record) => {
                const is_active = record.is_running;
                return (
                    <Tooltip title={is_active ? "정지" : "시작"}>
                        <Button
                            type={is_active ? "primary" : "default"}
                            danger={is_active}
                            shape="circle"
                            size="small"
                            icon={
                                is_active ? (
                                    <PauseCircleOutlined />
                                ) : (
                                    <PlayCircleOutlined />
                                )
                            }
                        />
                    </Tooltip>
                );
            },
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            width: 200,
            render: (text: string, record) => {
                const is_active = record.is_running;
                const is_completed = record.is_completed;
                return (
                    <Space direction="vertical" size={0}>
                        <Space>
                            {is_completed && (
                                <CheckCircleOutlined
                                    style={{ color: "#52c41a" }}
                                />
                            )}
                            <Text
                                strong
                                style={{
                                    color: is_active
                                        ? "#1890ff"
                                        : is_completed
                                        ? "#8c8c8c"
                                        : undefined,
                                    textDecoration: is_completed
                                        ? "line-through"
                                        : undefined,
                                }}
                            >
                                {text || record.work_name}
                            </Text>
                            {is_active && (
                                <Tag
                                    color="processing"
                                    style={{ marginLeft: 4 }}
                                >
                                    00:45
                                </Tag>
                            )}
                        </Space>
                    </Space>
                );
            },
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            width: 140,
            render: (text: string) => (
                <Tag color="blue" style={{ fontSize: 11 }}>
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
            title: "소요 시간",
            key: "duration",
            width: 100,
            align: "center",
            render: (_, record) => {
                const duration_str = formatDuration(record.duration_minutes);
                return (
                    <Text
                        style={{
                            fontFamily: "monospace",
                            color: record.is_running ? "#1890ff" : undefined,
                        }}
                    >
                        {duration_str}
                    </Text>
                );
            },
        },
        {
            title: "시간",
            key: "time_range",
            width: 110,
            render: (_, record) => {
                const time_range = record.end_time
                    ? `${record.start_time} ~ ${record.end_time}`
                    : `${record.start_time} ~`;
                return (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {time_range}
                    </Text>
                );
            },
        },
        {
            title: "액션",
            key: "action",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="수정">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="삭제">
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Tooltip>
                    {!record.is_completed && (
                        <Tooltip title="완료">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                style={{ color: "#52c41a" }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="demo-component">
            <Card
                size="small"
                title={
                    <Space>
                        <DatePicker
                            value={today}
                            format="YYYY-MM-DD (ddd)"
                            allowClear={false}
                            style={{ width: 160 }}
                            suffixIcon={null}
                            disabled
                        />
                        <Button size="small" icon={<LeftOutlined />} disabled />
                        <Button size="small" disabled>
                            오늘
                        </Button>
                        <Button
                            size="small"
                            icon={<RightOutlined />}
                            disabled
                        />
                    </Space>
                }
                extra={
                    <Space>
                        <Button size="small" icon={<CopyOutlined />} disabled>
                            복사
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            disabled
                        >
                            새 작업{" "}
                            <span style={{
                                fontSize: 10,
                                opacity: 0.85,
                                marginLeft: 2,
                                padding: "1px 3px",
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: 3,
                            }}>
                                Alt+N
                            </span>
                        </Button>
                    </Space>
                }
            >
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                        <Statistic
                            title="작업 수"
                            value={DEMO_RECORDS.length}
                            suffix="개"
                            valueStyle={{ fontSize: 20 }}
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="총 소요 시간"
                            value={formatDuration(total_minutes)}
                            valueStyle={{ fontSize: 20 }}
                        />
                    </Col>
                </Row>

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
            <Card
                title={
                    <Space>
                        <FolderOutlined />
                        <span>작업 프리셋</span>
                    </Space>
                }
                size="small"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        disabled
                    >
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                            추가
                            <span style={{
                                fontSize: 10,
                                opacity: 0.85,
                                marginLeft: 4,
                                padding: "1px 4px",
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: 3,
                            }}>
                                Alt+P
                            </span>
                        </span>
                    </Button>
                }
                className="demo-template-list-card"
            >
                <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 12 }}
                >
                    자주 사용하는 작업을 프리셋으로 저장하세요.
                    <br />
                    클릭하면 오늘의 작업 기록에 추가됩니다.
                </Text>

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
                                <div className="demo-template-header">
                                    <Tag
                                        color={template.color}
                                        style={{
                                            fontSize: 10,
                                            lineHeight: 1.3,
                                            padding: "1px 6px",
                                            margin: 0,
                                        }}
                                    >
                                        {template.work_name}
                                    </Tag>
                                </div>

                                <Text strong className="demo-template-title">
                                    {template.deal_name || template.work_name}
                                </Text>

                                {(template.task_name ||
                                    template.category_name) && (
                                    <Text
                                        type="secondary"
                                        className="demo-template-subtitle"
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

                            <div className="demo-template-actions">
                                <div className="demo-template-hover-buttons">
                                    <Tooltip title="수정">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                        />
                                    </Tooltip>
                                    <Tooltip title="삭제">
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                        />
                                    </Tooltip>
                                </div>

                                <Tooltip title="작업 추가">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
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

    return (
        <div className="demo-component">
            <Card
                size="small"
                title="일간 간트차트"
                extra={<Text type="secondary">2026-01-21</Text>}
            >
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
                                        background: "#1890ff",
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
                                        background: "#1890ff",
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
                                        background: "#faad14",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="demo-gantt-lunch"
                        style={{ left: "31.25%", width: "12.5%" }}
                    >
                        점심
                    </div>
                </div>
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
                        <span>
                            프리셋이 없습니다
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                "추가" 버튼으로 추가하세요
                            </Text>
                        </span>
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
            <Card size="small" title="데이터 관리">
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                        프리셋 설정
                    </Text>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "#fafafa",
                            borderRadius: 4,
                        }}
                    >
                        <div>
                            <Text>작업 추가 시 구분자(postfix) 사용</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ON 시: "회의" → "회의_0122_093045_123"
                            </Text>
                        </div>
                        <Tag color="blue">OFF</Tag>
                    </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                        백업 및 복원
                    </Text>
                    <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="small"
                    >
                        <Button
                            icon={<CopyOutlined />}
                            block
                            disabled
                            style={{ textAlign: "left" }}
                        >
                            데이터 내보내기 (Export)
                        </Button>
                        <Button
                            icon={<PlusOutlined />}
                            block
                            disabled
                            style={{ textAlign: "left" }}
                        >
                            데이터 가져오기 (Import)
                        </Button>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            * 가져오기 시 기존 데이터가 덮어씌워집니다
                        </Text>
                    </Space>
                </div>

                <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                        저장소 정보
                    </Text>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "#fafafa",
                            borderRadius: 4,
                        }}
                    >
                        <Text>저장 위치</Text>
                        <Tag color="green">Firebase Cloud</Tag>
                    </div>
                    <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 4, display: "block" }}
                    >
                        데이터가 클라우드에 자동으로 동기화됩니다
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
        { key: "Alt + N", action: "새 작업 추가", category: "일반" },
        { key: "Alt + S", action: "타이머 시작/중지", category: "타이머" },
        { key: "Alt + T", action: "오늘로 이동", category: "네비게이션" },
        { key: "Alt + ←", action: "이전 날짜", category: "네비게이션" },
        { key: "Alt + →", action: "다음 날짜", category: "네비게이션" },
    ];

    const columns: ColumnsType<(typeof shortcuts)[0]> = [
        {
            title: "단축키",
            dataIndex: "key",
            key: "key",
            width: 120,
            render: (t) => (
                <Tag
                    style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        padding: "4px 8px",
                    }}
                >
                    {t}
                </Tag>
            ),
        },
        { title: "기능", dataIndex: "action", key: "action" },
        {
            title: "카테고리",
            dataIndex: "category",
            key: "category",
            render: (t) => <Tag color="blue">{t}</Tag>,
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
            <div className="demo-badge">📱 실제 UI 미리보기</div>
            <Component />
        </div>
    );
}
