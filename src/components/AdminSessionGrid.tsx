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
} from "antd";
import {
    WarningOutlined,
    SettingOutlined,
    CalendarOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";
import { useWorkStore } from "../store/useWorkStore";
import { useAuth } from "../firebase/useAuth";
import type { WorkRecord, WorkSession } from "../types";

const { Content } = Layout;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

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

function AdminSessionGridContent() {
    const records = useWorkStore((state) => state.records);
    const deleteSession = useWorkStore((state) => state.deleteSession);

    const [show_conflicts_only, setShowConflictsOnly] = useState(false);
    const [date_range, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [selected_row_keys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const allSessions = useMemo(() => {
        return records
            .filter((r) => !r.is_deleted)
            .flatMap((record) =>
                record.sessions
                    .filter((s) => s.start_time && s.end_time)
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
                return a.start_time.localeCompare(b.start_time);
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

        if (show_conflicts_only) {
            result = result.filter((s) => conflictSessionIds.has(s.id));
        }

        return result;
    }, [allSessions, date_range, show_conflicts_only, conflictSessionIds]);

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
        rowClassName: (record) =>
            conflictSessionIds.has(record.id) ? "admin-conflict-row" : "",
        scroll: { x: 800 },
    };

    const conflictDates = new Set(conflicts.map((c) => c.date));

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
                            <Space>
                                <CalendarOutlined />
                                <RangePicker
                                    value={date_range}
                                    onChange={setDateRange}
                                    allowClear
                                    placeholder={["시작일", "종료일"]}
                                />
                            </Space>
                            <Space>
                                <Switch
                                    checked={show_conflicts_only}
                                    onChange={setShowConflictsOnly}
                                />
                                <Text>충돌만 보기</Text>
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
                        </div>

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
