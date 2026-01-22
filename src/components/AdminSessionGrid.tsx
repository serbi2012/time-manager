import { useMemo, useState } from "react";
import {
    Layout,
    Card,
    Table,
    Tag,
    Space,
    Typography,
    Switch,
    DatePicker,
    Empty,
    Tooltip,
    Button,
    Popconfirm,
    message,
    Segmented,
} from "antd";
import {
    WarningOutlined,
    SettingOutlined,
    CalendarOutlined,
    DeleteOutlined,
    BugOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";
import { useWorkStore } from "../store/useWorkStore";
import { useAuth } from "../firebase/useAuth";
import type { WorkRecord, WorkSession } from "../types";

const { Content } = Layout;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 문제 세션 유형 정의
type ProblemType = "zero_duration" | "missing_time" | "invalid_time" | "future_time";

interface ProblemInfo {
    type: ProblemType;
    description: string;
}

const ADMIN_EMAIL = "rlaxo0306@gmail.com";

interface SessionWithMeta extends WorkSession {
    record_id: string;
    work_name: string;
    deal_name: string;
    project_code: string;
    task_name: string;
    category_name: string;
}

interface ConflictInfo {
    date: string;
    session1: SessionWithMeta;
    session2: SessionWithMeta;
    overlap_minutes: number;
}

function timeToMinutes(time: string): number {
    const parts = time.split(":").map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
}

// 세션의 문제를 감지하는 함수
function detectSessionProblems(session: WorkSession, record_date: string): ProblemInfo[] {
    const problems: ProblemInfo[] = [];
    const session_date = session.date || record_date;

    // 1. 시간 정보 누락
    if (!session.start_time || !session.end_time) {
        problems.push({
            type: "missing_time",
            description: "시간 정보 누락",
        });
        return problems; // 시간이 없으면 다른 검사 불가
    }

    // 2. 시간 형식 유효성 검사
    const time_regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!time_regex.test(session.start_time) || !time_regex.test(session.end_time)) {
        problems.push({
            type: "invalid_time",
            description: "잘못된 시간 형식",
        });
    }

    // 3. 0분 세션 감지 (시작 = 종료)
    const start_mins = timeToMinutes(session.start_time);
    const end_mins = timeToMinutes(session.end_time);
    if (start_mins === end_mins) {
        problems.push({
            type: "zero_duration",
            description: `0분 세션 (${session.start_time})`,
        });
    }

    // 4. 미래 날짜 세션 감지
    const today = dayjs().format("YYYY-MM-DD");
    if (session_date > today) {
        problems.push({
            type: "future_time",
            description: `미래 날짜 세션 (${session_date})`,
        });
    }

    return problems;
}

// 모든 문제 세션을 찾는 함수
function findProblemSessions(records: WorkRecord[]): Map<string, ProblemInfo[]> {
    const problem_map = new Map<string, ProblemInfo[]>();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                const problems = detectSessionProblems(session, record.date);
                if (problems.length > 0) {
                    problem_map.set(session.id, problems);
                }
            });
        });

    return problem_map;
}

function findConflicts(records: WorkRecord[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    const sessionsByDate = new Map<string, SessionWithMeta[]>();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            record.sessions.forEach((session) => {
                if (!session.start_time || !session.end_time) return;

                const date = session.date || record.date;
                if (!sessionsByDate.has(date)) {
                    sessionsByDate.set(date, []);
                }
                sessionsByDate.get(date)!.push({
                    ...session,
                    record_id: record.id,
                    work_name: record.work_name,
                    deal_name: record.deal_name,
                    project_code: record.project_code,
                    task_name: record.task_name,
                    category_name: record.category_name,
                });
            });
        });

    sessionsByDate.forEach((sessions, date) => {
        for (let i = 0; i < sessions.length; i++) {
            for (let j = i + 1; j < sessions.length; j++) {
                const a = sessions[i];
                const b = sessions[j];

                const a_start = timeToMinutes(a.start_time);
                const a_end = timeToMinutes(a.end_time);
                const b_start = timeToMinutes(b.start_time);
                const b_end = timeToMinutes(b.end_time);

                if (!(a_end <= b_start || a_start >= b_end)) {
                    const overlap_start = Math.max(a_start, b_start);
                    const overlap_end = Math.min(a_end, b_end);
                    const overlap_minutes = overlap_end - overlap_start;

                    conflicts.push({
                        date,
                        session1: a,
                        session2: b,
                        overlap_minutes,
                    });
                }
            }
        }
    });

    return conflicts;
}

type ViewMode = "all" | "conflicts" | "problems";

function AdminSessionGridContent() {
    const records = useWorkStore((state) => state.records);
    const deleteSession = useWorkStore((state) => state.deleteSession);

    const [view_mode, setViewMode] = useState<ViewMode>("all");
    const [show_conflicts_only, setShowConflictsOnly] = useState(false);
    const [date_range, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [selected_row_keys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const allSessions = useMemo(() => {
        return records
            .filter((r) => !r.is_deleted)
            .flatMap((record) =>
                record.sessions
                    // 문제 세션도 포함하도록 필터 조건 완화
                    .map((session) => ({
                        ...session,
                        key: session.id,
                        record_id: record.id,
                        work_name: record.work_name,
                        deal_name: record.deal_name,
                        project_code: record.project_code,
                        task_name: record.task_name,
                        category_name: record.category_name,
                        date: session.date || record.date,
                    }))
            )
            .sort((a, b) => {
                const dateCompare = b.date.localeCompare(a.date);
                if (dateCompare !== 0) return dateCompare;
                return (a.start_time || "").localeCompare(b.start_time || "");
            });
    }, [records]);

    const conflicts = useMemo(() => findConflicts(records), [records]);

    const conflictSessionIds = useMemo(() => {
        const ids = new Set<string>();
        conflicts.forEach((c) => {
            ids.add(c.session1.id);
            ids.add(c.session2.id);
        });
        return ids;
    }, [conflicts]);

    const conflictPairs = useMemo(() => {
        const pairs = new Map<string, SessionWithMeta[]>();
        conflicts.forEach((c) => {
            if (!pairs.has(c.session1.id)) {
                pairs.set(c.session1.id, []);
            }
            pairs.get(c.session1.id)!.push(c.session2);

            if (!pairs.has(c.session2.id)) {
                pairs.set(c.session2.id, []);
            }
            pairs.get(c.session2.id)!.push(c.session1);
        });
        return pairs;
    }, [conflicts]);

    // 문제 세션 감지
    const problemSessions = useMemo(() => findProblemSessions(records), [records]);

    const problemSessionIds = useMemo(() => {
        return new Set(problemSessions.keys());
    }, [problemSessions]);

    // 선택 삭제 함수
    const handleBulkDelete = () => {
        if (selected_row_keys.length === 0) return;

        // 세션 ID로 record_id 찾아서 삭제
        selected_row_keys.forEach((sessionId) => {
            const session = allSessions.find((s) => s.id === sessionId);
            if (session) {
                deleteSession(session.record_id, session.id);
            }
        });

        message.success(`${selected_row_keys.length}개 세션이 삭제되었습니다`);
        setSelectedRowKeys([]);
    };

    const filteredSessions = useMemo(() => {
        let result = allSessions;

        if (date_range && date_range[0] && date_range[1]) {
            const start = date_range[0].format("YYYY-MM-DD");
            const end = date_range[1].format("YYYY-MM-DD");
            result = result.filter((s) => s.date >= start && s.date <= end);
        }

        // view_mode에 따른 필터링
        if (view_mode === "conflicts" || show_conflicts_only) {
            result = result.filter((s) => conflictSessionIds.has(s.id));
        } else if (view_mode === "problems") {
            result = result.filter((s) => problemSessionIds.has(s.id));
        }

        return result;
    }, [allSessions, date_range, view_mode, show_conflicts_only, conflictSessionIds, problemSessionIds]);

    const uniqueDates = useMemo(() => {
        const dates = new Set(allSessions.map((s) => s.date));
        return Array.from(dates).sort((a, b) => b.localeCompare(a));
    }, [allSessions]);

    const columns: ColumnsType<SessionWithMeta> = [
        {
            title: "날짜",
            dataIndex: "date",
            width: 120,
            filters: uniqueDates.slice(0, 30).map((d) => ({
                text: d,
                value: d,
            })),
            onFilter: (value, record) => record.date === value,
            sorter: (a, b) => a.date.localeCompare(b.date),
            render: (date: string) => (
                <Text style={{ whiteSpace: "nowrap" }}>{date}</Text>
            ),
        },
        {
            title: "시간",
            width: 130,
            render: (_, record) => (
                <Text style={{ whiteSpace: "nowrap", fontFamily: "monospace" }}>
                    {record.start_time} ~ {record.end_time}
                </Text>
            ),
            sorter: (a, b) => a.start_time.localeCompare(b.start_time),
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            ellipsis: true,
            filters: Array.from(new Set(allSessions.map((s) => s.work_name)))
                .slice(0, 20)
                .map((name) => ({ text: name, value: name })),
            onFilter: (value, record) => record.work_name === value,
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            ellipsis: true,
        },
        {
            title: "프로젝트",
            dataIndex: "project_code",
            width: 120,
            ellipsis: true,
        },
        {
            title: "소요시간",
            dataIndex: "duration_minutes",
            width: 90,
            align: "right",
            render: (mins: number) => `${mins}분`,
            sorter: (a, b) => a.duration_minutes - b.duration_minutes,
        },
        {
            title: "충돌",
            width: 80,
            align: "center",
            render: (_, record) => {
                const conflicting = conflictPairs.get(record.id);
                if (!conflicting || conflicting.length === 0) {
                    return <Text type="secondary">-</Text>;
                }

                const tooltipContent = (
                    <div>
                        <div style={{ marginBottom: 8, fontWeight: "bold" }}>
                            충돌하는 작업:
                        </div>
                        {conflicting.map((c, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                                • {c.work_name} ({c.start_time}~{c.end_time})
                            </div>
                        ))}
                    </div>
                );

                return (
                    <Tooltip title={tooltipContent} placement="left">
                        <Tag color="red" style={{ cursor: "help" }}>
                            <WarningOutlined /> {conflicting.length}
                        </Tag>
                    </Tooltip>
                );
            },
            filters: [
                { text: "충돌 있음", value: "conflict" },
                { text: "충돌 없음", value: "no-conflict" },
            ],
            onFilter: (value, record) => {
                const hasConflict = conflictSessionIds.has(record.id);
                return value === "conflict" ? hasConflict : !hasConflict;
            },
        },
        {
            title: "문제",
            width: 120,
            align: "center",
            render: (_, record) => {
                const problems = problemSessions.get(record.id);
                if (!problems || problems.length === 0) {
                    return <Text type="secondary">-</Text>;
                }

                const tooltipContent = (
                    <div>
                        <div style={{ marginBottom: 8, fontWeight: "bold" }}>
                            <BugOutlined /> 문제 발견:
                        </div>
                        {problems.map((p, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                                • {p.description}
                            </div>
                        ))}
                    </div>
                );

                // 문제 유형에 따른 태그 색상
                const getTagColor = (type: ProblemType) => {
                    switch (type) {
                        case "zero_duration":
                            return "orange";
                        case "missing_time":
                            return "red";
                        case "invalid_time":
                            return "magenta";
                        case "future_time":
                            return "purple";
                        default:
                            return "default";
                    }
                };

                return (
                    <Tooltip title={tooltipContent} placement="left">
                        <Tag color={getTagColor(problems[0].type)} style={{ cursor: "help" }}>
                            <ExclamationCircleOutlined /> {problems.length}
                        </Tag>
                    </Tooltip>
                );
            },
            filters: [
                { text: "문제 있음", value: "problem" },
                { text: "문제 없음", value: "no-problem" },
                { text: "0분 세션", value: "zero_duration" },
                { text: "시간 누락", value: "missing_time" },
            ],
            onFilter: (value, record) => {
                const problems = problemSessions.get(record.id);
                const hasProblem = problems && problems.length > 0;
                
                if (value === "problem") return hasProblem ?? false;
                if (value === "no-problem") return !hasProblem;
                if (value === "zero_duration") {
                    return problems?.some((p) => p.type === "zero_duration") ?? false;
                }
                if (value === "missing_time") {
                    return problems?.some((p) => p.type === "missing_time") ?? false;
                }
                return false;
            },
        },
    ];

    const tableProps: TableProps<SessionWithMeta> = {
        columns,
        dataSource: filteredSessions,
        rowKey: "id",
        size: "small",
        pagination: {
            pageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100", "200"],
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} / 총 ${total}개`,
        },
        rowSelection: {
            selectedRowKeys: selected_row_keys,
            onChange: (keys) => setSelectedRowKeys(keys),
        },
        rowClassName: (record) => {
            if (conflictSessionIds.has(record.id)) return "admin-conflict-row";
            if (problemSessionIds.has(record.id)) return "admin-problem-row";
            return "";
        },
        scroll: { x: 900 },
    };

    const conflictDates = new Set(conflicts.map((c) => c.date));

    // 문제 세션이 있는 날짜들
    const problemDates = useMemo(() => {
        const dates = new Set<string>();
        allSessions.forEach((s) => {
            if (problemSessionIds.has(s.id)) {
                dates.add(s.date);
            }
        });
        return dates;
    }, [allSessions, problemSessionIds]);

    // 문제 유형별 개수
    const problemStats = useMemo(() => {
        const stats = {
            zero_duration: 0,
            missing_time: 0,
            invalid_time: 0,
            future_time: 0,
        };
        problemSessions.forEach((problems) => {
            problems.forEach((p) => {
                stats[p.type]++;
            });
        });
        return stats;
    }, [problemSessions]);

    return (
        <Layout className="app-body" style={{ padding: 0 }}>
            <Content style={{ padding: 24 }}>
                <Card
                    title={
                        <Space>
                            <SettingOutlined />
                            <span>관리자 - 전체 세션 그리드</span>
                            <Tag color="purple">관리자</Tag>
                        </Space>
                    }
                    extra={
                        <Space size="middle" wrap>
                            {selected_row_keys.length > 0 && (
                                <Popconfirm
                                    title="선택 삭제"
                                    description={`${selected_row_keys.length}개 세션을 삭제하시겠습니까?`}
                                    onConfirm={handleBulkDelete}
                                    okText="삭제"
                                    cancelText="취소"
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                    >
                                        선택 삭제 ({selected_row_keys.length})
                                    </Button>
                                </Popconfirm>
                            )}
                            <Segmented
                                value={view_mode}
                                onChange={(value) => {
                                    setViewMode(value as ViewMode);
                                    setShowConflictsOnly(false);
                                }}
                                options={[
                                    { label: "전체", value: "all" },
                                    { 
                                        label: (
                                            <Space size={4}>
                                                <WarningOutlined />
                                                충돌 ({conflictSessionIds.size})
                                            </Space>
                                        ), 
                                        value: "conflicts" 
                                    },
                                    { 
                                        label: (
                                            <Space size={4}>
                                                <BugOutlined />
                                                문제 ({problemSessionIds.size})
                                            </Space>
                                        ), 
                                        value: "problems" 
                                    },
                                ]}
                            />
                            <Space>
                                <CalendarOutlined />
                                <RangePicker
                                    value={date_range}
                                    onChange={setDateRange}
                                    allowClear
                                    placeholder={["시작일", "종료일"]}
                                />
                            </Space>
                        </Space>
                    }
                >
                    <Space
                        direction="vertical"
                        size="middle"
                        style={{ width: "100%", marginBottom: 16 }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <Card size="small" style={{ minWidth: 150 }}>
                                <Text type="secondary">전체 세션</Text>
                                <Title level={4} style={{ margin: 0 }}>
                                    {allSessions.length}개
                                </Title>
                            </Card>
                            <Card
                                size="small"
                                style={{
                                    minWidth: 150,
                                    borderColor:
                                        conflicts.length > 0
                                            ? "#ff4d4f"
                                            : undefined,
                                }}
                            >
                                <Text type="secondary">충돌 세션</Text>
                                <Title
                                    level={4}
                                    style={{
                                        margin: 0,
                                        color:
                                            conflicts.length > 0
                                                ? "#ff4d4f"
                                                : undefined,
                                    }}
                                >
                                    {conflictSessionIds.size}개
                                </Title>
                            </Card>
                            <Card size="small" style={{ minWidth: 150 }}>
                                <Text type="secondary">충돌 발생일</Text>
                                <Title level={4} style={{ margin: 0 }}>
                                    {conflictDates.size}일
                                </Title>
                            </Card>
                            <Card
                                size="small"
                                style={{
                                    minWidth: 150,
                                    borderColor:
                                        problemSessionIds.size > 0
                                            ? "#fa8c16"
                                            : undefined,
                                }}
                            >
                                <Text type="secondary">
                                    <BugOutlined /> 문제 세션
                                </Text>
                                <Title
                                    level={4}
                                    style={{
                                        margin: 0,
                                        color:
                                            problemSessionIds.size > 0
                                                ? "#fa8c16"
                                                : undefined,
                                    }}
                                >
                                    {problemSessionIds.size}개
                                </Title>
                            </Card>
                        </div>

                        {/* 문제 세션 상세 통계 */}
                        {problemSessionIds.size > 0 && (
                            <Card
                                size="small"
                                style={{
                                    background: "#fff7e6",
                                    borderColor: "#ffd591",
                                }}
                            >
                                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                    <Text strong style={{ color: "#d46b08" }}>
                                        <BugOutlined /> 문제 유형별 현황
                                    </Text>
                                    <Space wrap>
                                        {problemStats.zero_duration > 0 && (
                                            <Tag color="orange">
                                                0분 세션: {problemStats.zero_duration}개
                                            </Tag>
                                        )}
                                        {problemStats.missing_time > 0 && (
                                            <Tag color="red">
                                                시간 누락: {problemStats.missing_time}개
                                            </Tag>
                                        )}
                                        {problemStats.invalid_time > 0 && (
                                            <Tag color="magenta">
                                                잘못된 형식: {problemStats.invalid_time}개
                                            </Tag>
                                        )}
                                        {problemStats.future_time > 0 && (
                                            <Tag color="purple">
                                                미래 날짜: {problemStats.future_time}개
                                            </Tag>
                                        )}
                                    </Space>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        문제 발생일: {Array.from(problemDates).sort().slice(0, 5).join(", ")}
                                        {problemDates.size > 5 && ` 외 ${problemDates.size - 5}일`}
                                    </Text>
                                </Space>
                            </Card>
                        )}

                        {conflicts.length > 0 && (
                            <Card
                                size="small"
                                style={{
                                    background: "#fff2f0",
                                    borderColor: "#ffccc7",
                                }}
                            >
                                <Space direction="vertical" size="small">
                                    <Text strong style={{ color: "#cf1322" }}>
                                        <WarningOutlined /> 충돌 발생 날짜
                                    </Text>
                                    <Space wrap>
                                        {Array.from(conflictDates)
                                            .sort()
                                            .map((date) => {
                                                const count = conflicts.filter(
                                                    (c) => c.date === date
                                                ).length;
                                                return (
                                                    <Tag
                                                        key={date}
                                                        color="red"
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => {
                                                            const d =
                                                                dayjs(date);
                                                            setDateRange([
                                                                d,
                                                                d,
                                                            ]);
                                                        }}
                                                    >
                                                        {date} ({count}건)
                                                    </Tag>
                                                );
                                            })}
                                    </Space>
                                </Space>
                            </Card>
                        )}
                    </Space>

                    <Table {...tableProps} />
                </Card>
            </Content>
        </Layout>
    );
}

export default function AdminSessionGrid() {
    const { user } = useAuth();

    if (user?.email !== ADMIN_EMAIL) {
        return (
            <Layout className="app-body" style={{ padding: 24 }}>
                <Content style={{ maxWidth: 800, margin: "0 auto" }}>
                    <Card>
                        <Empty
                            description="관리자 권한이 필요합니다"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                </Content>
            </Layout>
        );
    }

    return <AdminSessionGridContent />;
}
