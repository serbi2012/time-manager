import { useMemo, useState } from "react";
import {
    Layout,
    Card,
    Table,
    Tag,
    Space,
    Typography,
    DatePicker,
    Empty,
    Tooltip,
    Button,
    Popconfirm,
    message,
    Segmented,
    TimePicker,
    Alert,
    Modal,
    Tabs,
    Descriptions,
    Badge,
    Radio,
} from "antd";
import {
    WarningOutlined,
    SettingOutlined,
    CalendarOutlined,
    DeleteOutlined,
    BugOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    EyeInvisibleOutlined,
    CopyOutlined,
    MergeCellsOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    ExportOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";
import { useWorkStore } from "../store/useWorkStore";
import { useAuth } from "../firebase/useAuth";
import type { WorkRecord, WorkSession } from "../types";
import { timeToMinutes } from "../shared/lib/time";
import {
    RecordsExplorer,
    SessionsExplorer,
    StatsDashboard,
    TrashManager,
    ExportPanel,
    IntegrityChecker,
} from "../features/admin/ui";
import { formatDuration } from "../features/admin/lib";

const { Content } = Layout;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 문제 세션 유형 정의
type ProblemType =
    | "zero_duration"
    | "missing_time"
    | "invalid_time"
    | "future_time";

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

// 세션의 문제를 감지하는 함수
function detectSessionProblems(
    session: WorkSession,
    record_date: string
): ProblemInfo[] {
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
    if (
        !time_regex.test(session.start_time) ||
        !time_regex.test(session.end_time)
    ) {
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
function findProblemSessions(
    records: WorkRecord[]
): Map<string, ProblemInfo[]> {
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

// 중복 의심 레코드 그룹 타입
interface DuplicateGroup {
    key: string; // work_name + deal_name 조합
    work_name: string;
    deal_name: string;
    records: WorkRecord[];
    total_sessions: number;
    total_duration: number;
    date_range: string;
}

// 중복 의심 레코드 찾기 (같은 work_name + deal_name 조합)
function findDuplicateRecords(records: WorkRecord[]): DuplicateGroup[] {
    const group_map = new Map<string, WorkRecord[]>();

    records
        .filter((r) => !r.is_deleted)
        .forEach((record) => {
            const key = `${record.work_name}||${record.deal_name}`;
            if (!group_map.has(key)) {
                group_map.set(key, []);
            }
            group_map.get(key)!.push(record);
        });

    const duplicates: DuplicateGroup[] = [];

    group_map.forEach((group_records, key) => {
        // 2개 이상인 것만 중복 의심
        if (group_records.length >= 2) {
            const sorted_records = [...group_records].sort((a, b) =>
                a.date.localeCompare(b.date)
            );
            const dates = sorted_records.map((r) => r.date);
            const unique_dates = [...new Set(dates)];

            duplicates.push({
                key,
                work_name: group_records[0].work_name,
                deal_name: group_records[0].deal_name,
                records: sorted_records,
                total_sessions: group_records.reduce(
                    (sum, r) => sum + (r.sessions?.length || 0),
                    0
                ),
                total_duration: group_records.reduce(
                    (sum, r) => sum + r.duration_minutes,
                    0
                ),
                date_range:
                    unique_dates.length === 1
                        ? unique_dates[0]
                        : `${unique_dates[0]} ~ ${
                              unique_dates[unique_dates.length - 1]
                          }`,
            });
        }
    });

    return duplicates.sort((a, b) => b.records.length - a.records.length);
}

type ViewMode =
    | "all"
    | "conflicts"
    | "problems"
    | "time_search"
    | "invisible"
    | "running";
type AdminTab =
    | "sessions"
    | "records"
    | "explorer"
    | "statistics"
    | "trash"
    | "export"
    | "integrity";

function AdminSessionGridContent() {
    const records = useWorkStore((state) => state.records);
    const deleteSession = useWorkStore((state) => state.deleteSession);
    const updateRecord = useWorkStore((state) => state.updateRecord);
    const deleteRecord = useWorkStore((state) => state.deleteRecord);
    const permanentlyDeleteRecord = useWorkStore(
        (state) => state.permanentlyDeleteRecord
    );

    const [admin_tab, setAdminTab] = useState<AdminTab>("sessions");
    const [time_format, setTimeFormat] = useState<"minutes" | "hours">("hours");
    const [view_mode, setViewMode] = useState<ViewMode>("all");
    const [date_range, setDateRange] = useState<
        [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    >(null);
    const [selected_row_keys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // 시간 검색 관련 상태
    const [search_date, setSearchDate] = useState<dayjs.Dayjs | null>(dayjs());
    const [search_time, setSearchTime] = useState<dayjs.Dayjs | null>(null);

    // 레코드 분석 관련 상태
    const [selected_record_keys, setSelectedRecordKeys] = useState<React.Key[]>(
        []
    );
    const [detail_modal_record, setDetailModalRecord] =
        useState<WorkRecord | null>(null);
    const [merge_modal_open, setMergeModalOpen] = useState(false);
    const [merge_target_group, setMergeTargetGroup] =
        useState<DuplicateGroup | null>(null);

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
    const problemSessions = useMemo(
        () => findProblemSessions(records),
        [records]
    );

    const problemSessionIds = useMemo(() => {
        return new Set(problemSessions.keys());
    }, [problemSessions]);

    // 간트에서 보이지 않는 세션 (0분 세션, 1분 미만 등)
    const invisibleSessionIds = useMemo(() => {
        const ids = new Set<string>();
        allSessions.forEach((s) => {
            if (!s.start_time || !s.end_time) {
                ids.add(s.id);
                return;
            }
            const start_mins = timeToMinutes(s.start_time);
            const end_mins = timeToMinutes(s.end_time);
            // 0분 세션 또는 너무 짧은 세션 (1분 이하)
            if (end_mins - start_mins <= 1) {
                ids.add(s.id);
            }
        });
        return ids;
    }, [allSessions]);

    // 진행 중인 세션 (end_time === "" 인 세션)
    const runningSessions = useMemo(() => {
        return allSessions.filter((s) => s.end_time === "");
    }, [allSessions]);

    const runningSessionIds = useMemo(() => {
        return new Set(runningSessions.map((s) => s.id));
    }, [runningSessions]);

    // 중복 진행 중 세션 (같은 record_id에 2개 이상의 진행 중 세션)
    const duplicateRunningSessions = useMemo(() => {
        const by_record = new Map<string, typeof runningSessions>();
        runningSessions.forEach((s) => {
            if (!by_record.has(s.record_id)) {
                by_record.set(s.record_id, []);
            }
            by_record.get(s.record_id)!.push(s);
        });
        return Array.from(by_record.entries())
            .filter(([, sessions]) => sessions.length >= 2)
            .map(([record_id, sessions]) => ({
                record_id,
                work_name: sessions[0].work_name,
                deal_name: sessions[0].deal_name,
                sessions,
            }));
    }, [runningSessions]);

    // 특정 시간에 걸쳐있는 세션 찾기
    const timeSearchResults = useMemo(() => {
        if (!search_date || !search_time) return new Set<string>();

        const target_date = search_date.format("YYYY-MM-DD");
        const target_mins = search_time.hour() * 60 + search_time.minute();

        const ids = new Set<string>();
        allSessions.forEach((s) => {
            if (s.date !== target_date) return;
            if (!s.start_time || !s.end_time) return;

            const start_mins = timeToMinutes(s.start_time);
            const end_mins = timeToMinutes(s.end_time);

            // 해당 시간이 세션 범위 안에 있는지 확인
            // 0분 세션의 경우 정확히 일치하는지 확인
            if (start_mins === end_mins) {
                if (start_mins === target_mins) {
                    ids.add(s.id);
                }
            } else if (target_mins >= start_mins && target_mins < end_mins) {
                ids.add(s.id);
            }
        });
        return ids;
    }, [allSessions, search_date, search_time]);

    // 중복 의심 레코드 그룹
    const duplicateGroups = useMemo(
        () => findDuplicateRecords(records),
        [records]
    );

    // 전체 레코드 목록 (삭제되지 않은 것만)
    const allRecords = useMemo(() => {
        return records
            .filter((r) => !r.is_deleted)
            .sort((a, b) => {
                const date_cmp = b.date.localeCompare(a.date);
                if (date_cmp !== 0) return date_cmp;
                return (b.start_time || "").localeCompare(a.start_time || "");
            });
    }, [records]);

    // 레코드 데이터를 클립보드에 복사
    const handleCopyRecordData = (record_ids: React.Key[]) => {
        const selected_records = records.filter((r) =>
            record_ids.includes(r.id)
        );
        const json_data = JSON.stringify(selected_records, null, 2);
        navigator.clipboard.writeText(json_data);
        message.success(
            `${selected_records.length}개 레코드 데이터가 클립보드에 복사되었습니다`
        );
    };

    // 레코드 병합 실행
    const handleMergeRecords = () => {
        if (!merge_target_group || merge_target_group.records.length < 2)
            return;

        const sorted_records = [...merge_target_group.records].sort((a, b) => {
            // 날짜와 시작 시간으로 정렬
            const date_cmp = a.date.localeCompare(b.date);
            if (date_cmp !== 0) return date_cmp;
            return (a.start_time || "").localeCompare(b.start_time || "");
        });

        // 첫 번째 레코드를 기준으로 병합
        const base_record = sorted_records[0];
        const other_records = sorted_records.slice(1);

        // 모든 세션 수집 (중복 제거)
        const all_sessions: WorkSession[] = [...(base_record.sessions || [])];
        const session_ids = new Set(all_sessions.map((s) => s.id));

        other_records.forEach((r) => {
            (r.sessions || []).forEach((s) => {
                if (!session_ids.has(s.id)) {
                    all_sessions.push(s);
                    session_ids.add(s.id);
                }
            });
        });

        // 세션 정렬 (날짜, 시작 시간 순)
        all_sessions.sort((a, b) => {
            const date_a = a.date || base_record.date;
            const date_b = b.date || base_record.date;
            const date_cmp = date_a.localeCompare(date_b);
            if (date_cmp !== 0) return date_cmp;
            return (a.start_time || "").localeCompare(b.start_time || "");
        });

        // 총 시간 계산
        const total_duration = all_sessions.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0
        );

        // 시작/종료 시간 업데이트
        const first_session = all_sessions[0];
        const last_session = all_sessions[all_sessions.length - 1];

        // 기준 레코드 업데이트
        updateRecord(base_record.id, {
            sessions: all_sessions,
            duration_minutes: total_duration,
            start_time: first_session?.start_time || base_record.start_time,
            end_time: last_session?.end_time || base_record.end_time,
            // 가장 이른 날짜로 설정
            date: all_sessions[0]?.date || base_record.date,
        });

        // 나머지 레코드 삭제
        other_records.forEach((r) => {
            deleteRecord(r.id);
        });

        message.success(
            `${merge_target_group.records.length}개 레코드가 1개로 병합되었습니다 (세션 ${all_sessions.length}개, 총 ${total_duration}분)`
        );
        setMergeModalOpen(false);
        setMergeTargetGroup(null);
    };

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

        // 시간 검색 모드일 때는 날짜 범위 필터 무시
        if (view_mode !== "time_search") {
            if (date_range && date_range[0] && date_range[1]) {
                const start = date_range[0].format("YYYY-MM-DD");
                const end = date_range[1].format("YYYY-MM-DD");
                result = result.filter((s) => s.date >= start && s.date <= end);
            }
        }

        // view_mode에 따른 필터링
        if (view_mode === "conflicts") {
            result = result.filter((s) => conflictSessionIds.has(s.id));
        } else if (view_mode === "problems") {
            result = result.filter((s) => problemSessionIds.has(s.id));
        } else if (view_mode === "invisible") {
            result = result.filter((s) => invisibleSessionIds.has(s.id));
        } else if (view_mode === "running") {
            result = result.filter((s) => runningSessionIds.has(s.id));
        } else if (view_mode === "time_search") {
            // 시간 검색 모드: 검색 조건이 있을 때만 필터링
            if (search_date && search_time) {
                result = result.filter((s) => timeSearchResults.has(s.id));
            } else if (search_date) {
                // 날짜만 선택한 경우 해당 날짜의 모든 세션
                const target_date = search_date.format("YYYY-MM-DD");
                result = result.filter((s) => s.date === target_date);
            }
        }

        return result;
    }, [
        allSessions,
        date_range,
        view_mode,
        conflictSessionIds,
        problemSessionIds,
        invisibleSessionIds,
        runningSessionIds,
        timeSearchResults,
        search_date,
        search_time,
    ]);

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
            width: 150,
            render: (_, record) =>
                record.end_time === "" ? (
                    <Space size={4}>
                        <Text
                            style={{
                                whiteSpace: "nowrap",
                                fontFamily: "monospace",
                            }}
                        >
                            {record.start_time} ~
                        </Text>
                        <Tag color="green" icon={<PlayCircleOutlined />}>
                            진행중
                        </Tag>
                    </Space>
                ) : (
                    <Text
                        style={{
                            whiteSpace: "nowrap",
                            fontFamily: "monospace",
                        }}
                    >
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
            render: (mins: number) =>
                formatDuration(mins || 0, time_format),
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
                        <Tag
                            color={getTagColor(problems[0].type)}
                            style={{ cursor: "help" }}
                        >
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
                    return (
                        problems?.some((p) => p.type === "zero_duration") ??
                        false
                    );
                }
                if (value === "missing_time") {
                    return (
                        problems?.some((p) => p.type === "missing_time") ??
                        false
                    );
                }
                return false;
            },
        },
        {
            title: "간트",
            width: 80,
            align: "center",
            render: (_, record) => {
                const is_invisible = invisibleSessionIds.has(record.id);
                if (is_invisible) {
                    return (
                        <Tooltip title="이 세션은 간트차트에서 보이지 않습니다 (0분 또는 1분 이하)">
                            <Tag color="purple" style={{ cursor: "help" }}>
                                <EyeInvisibleOutlined /> 미표시
                            </Tag>
                        </Tooltip>
                    );
                }
                return <Text type="secondary">표시</Text>;
            },
            filters: [
                { text: "간트 표시", value: "visible" },
                { text: "간트 미표시", value: "invisible" },
            ],
            onFilter: (value, record) => {
                const is_invisible = invisibleSessionIds.has(record.id);
                return value === "invisible" ? is_invisible : !is_invisible;
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
            if (invisibleSessionIds.has(record.id))
                return "admin-invisible-row";
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

    // 레코드 테이블 컬럼
    const recordColumns: ColumnsType<WorkRecord> = [
        {
            title: "날짜",
            dataIndex: "date",
            width: 110,
            sorter: (a, b) => a.date.localeCompare(b.date),
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            ellipsis: true,
            width: 200,
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
        },
        {
            title: "업무명",
            dataIndex: "task_name",
            width: 80,
        },
        {
            title: "카테고리",
            dataIndex: "category_name",
            width: 90,
        },
        {
            title: "세션",
            width: 70,
            align: "center",
            render: (_, record) => (
                <Badge
                    count={record.sessions?.length || 0}
                    showZero
                    color="#1890ff"
                />
            ),
        },
        {
            title: "소요시간",
            dataIndex: "duration_minutes",
            width: 90,
            align: "right",
            render: (mins: number) =>
                formatDuration(mins || 0, time_format),
            sorter: (a, b) => a.duration_minutes - b.duration_minutes,
        },
        {
            title: "시간",
            width: 120,
            render: (_, record) => (
                <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {record.start_time || "-"} ~ {record.end_time || "-"}
                </Text>
            ),
        },
        {
            title: "상태",
            width: 100,
            render: (_, record) => (
                <Space size={4}>
                    {record.is_completed && <Tag color="green">완료</Tag>}
                    {!record.sessions?.length && (
                        <Tag color="orange">세션없음</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "액션",
            width: 100,
            fixed: "right",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="상세 데이터 보기">
                        <Button
                            type="text"
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() => setDetailModalRecord(record)}
                        />
                    </Tooltip>
                    <Tooltip title="데이터 복사">
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyRecordData([record.id])}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 중복 그룹 테이블 컬럼
    const duplicateGroupColumns: ColumnsType<DuplicateGroup> = [
        {
            title: "작업명",
            dataIndex: "work_name",
            ellipsis: true,
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            ellipsis: true,
        },
        {
            title: "레코드 수",
            width: 100,
            align: "center",
            render: (_, group) => (
                <Tag color="red">{group.records.length}개</Tag>
            ),
            sorter: (a, b) => a.records.length - b.records.length,
        },
        {
            title: "총 세션",
            dataIndex: "total_sessions",
            width: 90,
            align: "center",
        },
        {
            title: "총 시간",
            dataIndex: "total_duration",
            width: 90,
            align: "right",
            render: (mins: number) => `${mins}분`,
        },
        {
            title: "날짜 범위",
            dataIndex: "date_range",
            width: 180,
        },
        {
            title: "액션",
            width: 160,
            fixed: "right",
            render: (_, group) => (
                <Space size={4}>
                    <Tooltip title="그룹 데이터 복사">
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() =>
                                handleCopyRecordData(
                                    group.records.map((r) => r.id)
                                )
                            }
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        size="small"
                        icon={<MergeCellsOutlined />}
                        onClick={() => {
                            setMergeTargetGroup(group);
                            setMergeModalOpen(true);
                        }}
                    >
                        병합
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Layout className="app-body" style={{ padding: 0 }}>
            <Content style={{ padding: 24 }}>
                <Card
                    title={
                        <Space>
                            <SettingOutlined />
                            <span>관리자 패널</span>
                            <Tag color="purple">관리자</Tag>
                        </Space>
                    }
                    extra={
                        <Space>
                            <span style={{ color: "#666", fontSize: 13 }}>
                                시간 표시:
                            </span>
                            <Radio.Group
                                value={time_format}
                                onChange={(e) => setTimeFormat(e.target.value)}
                                size="small"
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="hours">
                                    시간 분
                                </Radio.Button>
                                <Radio.Button value="minutes">
                                    분
                                </Radio.Button>
                            </Radio.Group>
                        </Space>
                    }
                >
                    <Tabs
                        activeKey={admin_tab}
                        onChange={(key) => setAdminTab(key as AdminTab)}
                        items={[
                            {
                                key: "sessions",
                                label: (
                                    <Space>
                                        <CalendarOutlined />
                                        세션 분석
                                    </Space>
                                ),
                            },
                            {
                                key: "records",
                                label: (
                                    <Space>
                                        <DatabaseOutlined />
                                        레코드 분석
                                        {duplicateGroups.length > 0 && (
                                            <Badge
                                                count={duplicateGroups.length}
                                                size="small"
                                            />
                                        )}
                                    </Space>
                                ),
                            },
                            {
                                key: "explorer",
                                label: (
                                    <Space>
                                        <SearchOutlined />
                                        데이터 탐색기
                                    </Space>
                                ),
                            },
                            {
                                key: "statistics",
                                label: (
                                    <Space>
                                        <BarChartOutlined />
                                        통계
                                    </Space>
                                ),
                            },
                            {
                                key: "trash",
                                label: (
                                    <Space>
                                        <DeleteOutlined />
                                        휴지통
                                        {records.filter((r) => r.is_deleted)
                                            .length > 0 && (
                                            <Badge
                                                count={
                                                    records.filter(
                                                        (r) => r.is_deleted
                                                    ).length
                                                }
                                                size="small"
                                            />
                                        )}
                                    </Space>
                                ),
                            },
                            {
                                key: "export",
                                label: (
                                    <Space>
                                        <ExportOutlined />
                                        내보내기
                                    </Space>
                                ),
                            },
                            {
                                key: "integrity",
                                label: (
                                    <Space>
                                        <SafetyCertificateOutlined />
                                        정합성 검사
                                    </Space>
                                ),
                            },
                        ]}
                    />

                    {/* 세션 분석 탭 */}
                    {admin_tab === "sessions" && (
                        <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                        >
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
                                            선택 삭제 (
                                            {selected_row_keys.length})
                                        </Button>
                                    </Popconfirm>
                                )}
                                <Segmented
                                    value={view_mode}
                                    onChange={(value) =>
                                        setViewMode(value as ViewMode)
                                    }
                                    options={[
                                        { label: "전체", value: "all" },
                                        {
                                            label: (
                                                <Space size={4}>
                                                    <PlayCircleOutlined />
                                                    진행중 (
                                                    {runningSessionIds.size})
                                                </Space>
                                            ),
                                            value: "running",
                                        },
                                        {
                                            label: (
                                                <Space size={4}>
                                                    <WarningOutlined />
                                                    충돌 (
                                                    {conflictSessionIds.size})
                                                </Space>
                                            ),
                                            value: "conflicts",
                                        },
                                        {
                                            label: (
                                                <Space size={4}>
                                                    <BugOutlined />
                                                    문제 (
                                                    {problemSessionIds.size})
                                                </Space>
                                            ),
                                            value: "problems",
                                        },
                                        {
                                            label: (
                                                <Space size={4}>
                                                    <EyeInvisibleOutlined />
                                                    간트미표시 (
                                                    {invisibleSessionIds.size})
                                                </Space>
                                            ),
                                            value: "invisible",
                                        },
                                        {
                                            label: (
                                                <Space size={4}>
                                                    <SearchOutlined />
                                                    시간검색
                                                </Space>
                                            ),
                                            value: "time_search",
                                        },
                                    ]}
                                />
                                {view_mode !== "time_search" && (
                                    <Space>
                                        <CalendarOutlined />
                                        <RangePicker
                                            value={date_range}
                                            onChange={setDateRange}
                                            allowClear
                                            placeholder={["시작일", "종료일"]}
                                        />
                                    </Space>
                                )}
                            </Space>
                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: "100%", marginBottom: 16 }}
                            >
                                {/* 시간 검색 UI */}
                                {view_mode === "time_search" && (
                                    <Card
                                        size="small"
                                        style={{
                                            background: "#e6f7ff",
                                            borderColor: "#91d5ff",
                                        }}
                                    >
                                        <Space
                                            direction="vertical"
                                            size="small"
                                            style={{ width: "100%" }}
                                        >
                                            <Text
                                                strong
                                                style={{ color: "#096dd9" }}
                                            >
                                                <SearchOutlined /> 특정 시간대
                                                검색
                                            </Text>
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 12 }}
                                            >
                                                특정 날짜와 시간을 입력하면 해당
                                                시간에 걸쳐있는 모든 세션을
                                                찾습니다. 간트차트에서 보이지
                                                않는 세션도 찾을 수 있습니다.
                                            </Text>
                                            <Space wrap>
                                                <Space>
                                                    <Text>날짜:</Text>
                                                    <DatePicker
                                                        value={search_date}
                                                        onChange={setSearchDate}
                                                        placeholder="날짜 선택"
                                                        allowClear={false}
                                                    />
                                                </Space>
                                                <Space>
                                                    <Text>시간:</Text>
                                                    <TimePicker
                                                        value={search_time}
                                                        onChange={setSearchTime}
                                                        format="HH:mm"
                                                        placeholder="시간 선택"
                                                        minuteStep={1}
                                                    />
                                                </Space>
                                                {search_time && (
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            setSearchTime(null)
                                                        }
                                                    >
                                                        시간 초기화
                                                    </Button>
                                                )}
                                            </Space>
                                            {search_date && search_time && (
                                                <Alert
                                                    type={
                                                        timeSearchResults.size >
                                                        0
                                                            ? "warning"
                                                            : "success"
                                                    }
                                                    message={
                                                        timeSearchResults.size >
                                                        0
                                                            ? `${search_date.format(
                                                                  "YYYY-MM-DD"
                                                              )} ${search_time.format(
                                                                  "HH:mm"
                                                              )}에 ${
                                                                  timeSearchResults.size
                                                              }개의 세션이 걸쳐있습니다.`
                                                            : `${search_date.format(
                                                                  "YYYY-MM-DD"
                                                              )} ${search_time.format(
                                                                  "HH:mm"
                                                              )}에 걸쳐있는 세션이 없습니다.`
                                                    }
                                                    showIcon
                                                    style={{ marginTop: 8 }}
                                                />
                                            )}
                                        </Space>
                                    </Card>
                                )}

                                {/* 간트 미표시 세션 설명 */}
                                {view_mode === "invisible" &&
                                    invisibleSessionIds.size > 0 && (
                                        <Alert
                                            type="warning"
                                            message="간트차트에서 보이지 않는 세션"
                                            description="0분 세션이나 1분 이하의 세션은 간트차트에서 너비가 너무 작아 보이지 않습니다. 이 세션들은 충돌을 일으킬 수 있지만 시각적으로 확인이 어렵습니다."
                                            showIcon
                                        />
                                    )}

                                <div
                                    style={{
                                        display: "flex",
                                        gap: 16,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Card
                                        size="small"
                                        style={{ minWidth: 150 }}
                                    >
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
                                    <Card
                                        size="small"
                                        style={{ minWidth: 150 }}
                                    >
                                        <Text type="secondary">
                                            충돌 발생일
                                        </Text>
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
                                    <Card
                                        size="small"
                                        style={{
                                            minWidth: 150,
                                            borderColor:
                                                invisibleSessionIds.size > 0
                                                    ? "#722ed1"
                                                    : undefined,
                                        }}
                                    >
                                        <Text type="secondary">
                                            <EyeInvisibleOutlined /> 간트 미표시
                                        </Text>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color:
                                                    invisibleSessionIds.size > 0
                                                        ? "#722ed1"
                                                        : undefined,
                                            }}
                                        >
                                            {invisibleSessionIds.size}개
                                        </Title>
                                    </Card>
                                    <Card
                                        size="small"
                                        style={{
                                            minWidth: 150,
                                            borderColor:
                                                runningSessionIds.size > 0
                                                    ? "#52c41a"
                                                    : undefined,
                                        }}
                                    >
                                        <Text type="secondary">
                                            <PlayCircleOutlined /> 진행 중
                                        </Text>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color:
                                                    runningSessionIds.size > 0
                                                        ? "#52c41a"
                                                        : undefined,
                                            }}
                                        >
                                            {runningSessionIds.size}개
                                        </Title>
                                    </Card>
                                </div>

                                {/* 진행 중 세션 상세 정보 */}
                                {view_mode === "running" &&
                                    runningSessionIds.size > 0 && (
                                        <Card
                                            size="small"
                                            style={{
                                                background: "#f6ffed",
                                                borderColor: "#b7eb8f",
                                            }}
                                        >
                                            <Space
                                                direction="vertical"
                                                size="small"
                                                style={{ width: "100%" }}
                                            >
                                                <Text
                                                    strong
                                                    style={{ color: "#389e0d" }}
                                                >
                                                    <PlayCircleOutlined /> 진행
                                                    중 세션 현황
                                                </Text>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    종료 시간이
                                                    비어있는(end_time === "")
                                                    세션입니다. 타이머가 실행
                                                    중이거나 비정상 종료된
                                                    세션일 수 있습니다.
                                                </Text>
                                                {duplicateRunningSessions.length >
                                                    0 && (
                                                    <Alert
                                                        type="error"
                                                        showIcon
                                                        message={
                                                            <span>
                                                                <ExclamationCircleOutlined />{" "}
                                                                중복 진행 중
                                                                세션 발견:{" "}
                                                                {
                                                                    duplicateRunningSessions.length
                                                                }
                                                                개 레코드
                                                            </span>
                                                        }
                                                        description={
                                                            <Space
                                                                direction="vertical"
                                                                size="small"
                                                            >
                                                                {duplicateRunningSessions.map(
                                                                    (dup) => (
                                                                        <Text
                                                                            key={
                                                                                dup.record_id
                                                                            }
                                                                            style={{
                                                                                fontSize: 12,
                                                                            }}
                                                                        >
                                                                            <WarningOutlined
                                                                                style={{
                                                                                    color: "#ff4d4f",
                                                                                }}
                                                                            />{" "}
                                                                            "
                                                                            {
                                                                                dup.work_name
                                                                            }{" "}
                                                                            &gt;{" "}
                                                                            {
                                                                                dup.deal_name
                                                                            }
                                                                            " -{" "}
                                                                            {
                                                                                dup
                                                                                    .sessions
                                                                                    .length
                                                                            }
                                                                            개의
                                                                            진행
                                                                            중
                                                                            세션
                                                                        </Text>
                                                                    )
                                                                )}
                                                            </Space>
                                                        }
                                                    />
                                                )}
                                                <Space wrap>
                                                    {runningSessions.map(
                                                        (s) => (
                                                            <Tag
                                                                key={s.id}
                                                                color="green"
                                                                icon={
                                                                    <ClockCircleOutlined />
                                                                }
                                                            >
                                                                {s.work_name}{" "}
                                                                &gt;{" "}
                                                                {s.deal_name} (
                                                                {s.date}{" "}
                                                                {s.start_time}~)
                                                            </Tag>
                                                        )
                                                    )}
                                                </Space>
                                            </Space>
                                        </Card>
                                    )}

                                {/* 문제 세션 상세 통계 */}
                                {problemSessionIds.size > 0 && (
                                    <Card
                                        size="small"
                                        style={{
                                            background: "#fff7e6",
                                            borderColor: "#ffd591",
                                        }}
                                    >
                                        <Space
                                            direction="vertical"
                                            size="small"
                                            style={{ width: "100%" }}
                                        >
                                            <Text
                                                strong
                                                style={{ color: "#d46b08" }}
                                            >
                                                <BugOutlined /> 문제 유형별 현황
                                            </Text>
                                            <Space wrap>
                                                {problemStats.zero_duration >
                                                    0 && (
                                                    <Tag color="orange">
                                                        0분 세션:{" "}
                                                        {
                                                            problemStats.zero_duration
                                                        }
                                                        개
                                                    </Tag>
                                                )}
                                                {problemStats.missing_time >
                                                    0 && (
                                                    <Tag color="red">
                                                        시간 누락:{" "}
                                                        {
                                                            problemStats.missing_time
                                                        }
                                                        개
                                                    </Tag>
                                                )}
                                                {problemStats.invalid_time >
                                                    0 && (
                                                    <Tag color="magenta">
                                                        잘못된 형식:{" "}
                                                        {
                                                            problemStats.invalid_time
                                                        }
                                                        개
                                                    </Tag>
                                                )}
                                                {problemStats.future_time >
                                                    0 && (
                                                    <Tag color="purple">
                                                        미래 날짜:{" "}
                                                        {
                                                            problemStats.future_time
                                                        }
                                                        개
                                                    </Tag>
                                                )}
                                            </Space>
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 12 }}
                                            >
                                                문제 발생일:{" "}
                                                {Array.from(problemDates)
                                                    .sort()
                                                    .slice(0, 5)
                                                    .join(", ")}
                                                {problemDates.size > 5 &&
                                                    ` 외 ${
                                                        problemDates.size - 5
                                                    }일`}
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
                                        <Space
                                            direction="vertical"
                                            size="small"
                                        >
                                            <Text
                                                strong
                                                style={{ color: "#cf1322" }}
                                            >
                                                <WarningOutlined /> 충돌 발생
                                                날짜
                                            </Text>
                                            <Space wrap>
                                                {Array.from(conflictDates)
                                                    .sort()
                                                    .map((date) => {
                                                        const count =
                                                            conflicts.filter(
                                                                (c) =>
                                                                    c.date ===
                                                                    date
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
                                                                        dayjs(
                                                                            date
                                                                        );
                                                                    setDateRange(
                                                                        [d, d]
                                                                    );
                                                                }}
                                                            >
                                                                {date} ({count}
                                                                건)
                                                            </Tag>
                                                        );
                                                    })}
                                            </Space>
                                        </Space>
                                    </Card>
                                )}
                            </Space>

                            <Table {...tableProps} />
                        </Space>
                    )}

                    {/* 레코드 분석 탭 */}
                    {admin_tab === "records" && (
                        <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                        >
                            {/* 통계 카드 */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 16,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Card size="small" style={{ minWidth: 150 }}>
                                    <Text type="secondary">전체 레코드</Text>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {allRecords.length}개
                                    </Title>
                                </Card>
                                <Card
                                    size="small"
                                    style={{
                                        minWidth: 150,
                                        borderColor:
                                            duplicateGroups.length > 0
                                                ? "#ff4d4f"
                                                : undefined,
                                    }}
                                >
                                    <Text type="secondary">중복 의심 그룹</Text>
                                    <Title
                                        level={4}
                                        style={{
                                            margin: 0,
                                            color:
                                                duplicateGroups.length > 0
                                                    ? "#ff4d4f"
                                                    : undefined,
                                        }}
                                    >
                                        {duplicateGroups.length}개
                                    </Title>
                                </Card>
                                <Card size="small" style={{ minWidth: 150 }}>
                                    <Text type="secondary">
                                        중복 의심 레코드
                                    </Text>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {duplicateGroups.reduce(
                                            (sum, g) => sum + g.records.length,
                                            0
                                        )}
                                        개
                                    </Title>
                                </Card>
                            </div>

                            {/* 중복 의심 그룹 */}
                            {duplicateGroups.length > 0 && (
                                <Card
                                    size="small"
                                    title={
                                        <Space>
                                            <WarningOutlined
                                                style={{ color: "#ff4d4f" }}
                                            />
                                            <span>중복 의심 레코드 그룹</span>
                                            <Tag color="red">
                                                {duplicateGroups.length}개 그룹
                                            </Tag>
                                        </Space>
                                    }
                                    style={{ borderColor: "#ffccc7" }}
                                >
                                    <Alert
                                        type="warning"
                                        message="같은 작업명 + 거래명 조합을 가진 레코드들입니다. 병합이 필요한지 확인하세요."
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                    <Table
                                        columns={duplicateGroupColumns}
                                        dataSource={duplicateGroups}
                                        rowKey="key"
                                        size="small"
                                        pagination={false}
                                        expandable={{
                                            expandedRowRender: (group) => (
                                                <Table
                                                    columns={recordColumns.filter(
                                                        (c) =>
                                                            c.title !== "액션"
                                                    )}
                                                    dataSource={group.records}
                                                    rowKey="id"
                                                    size="small"
                                                    pagination={false}
                                                />
                                            ),
                                        }}
                                        scroll={{ x: 900 }}
                                    />
                                </Card>
                            )}

                            {/* 전체 레코드 목록 */}
                            <Card
                                size="small"
                                title={
                                    <Space>
                                        <DatabaseOutlined />
                                        <span>전체 레코드</span>
                                    </Space>
                                }
                                extra={
                                    <Space>
                                        {selected_record_keys.length > 0 && (
                                            <>
                                                <Button
                                                    icon={<CopyOutlined />}
                                                    onClick={() =>
                                                        handleCopyRecordData(
                                                            selected_record_keys
                                                        )
                                                    }
                                                >
                                                    선택 데이터 복사 (
                                                    {
                                                        selected_record_keys.length
                                                    }
                                                    )
                                                </Button>
                                                <Popconfirm
                                                    title="선택 삭제"
                                                    description={`${selected_record_keys.length}개 레코드를 삭제하시겠습니까?`}
                                                    onConfirm={() => {
                                                        selected_record_keys.forEach(
                                                            (id) => {
                                                                deleteRecord(
                                                                    id as string
                                                                );
                                                            }
                                                        );
                                                        message.success(
                                                            `${selected_record_keys.length}개 레코드가 삭제되었습니다`
                                                        );
                                                        setSelectedRecordKeys(
                                                            []
                                                        );
                                                    }}
                                                    okText="삭제"
                                                    cancelText="취소"
                                                >
                                                    <Button
                                                        icon={
                                                            <DeleteOutlined />
                                                        }
                                                        danger
                                                    >
                                                        선택 삭제
                                                    </Button>
                                                </Popconfirm>
                                            </>
                                        )}
                                    </Space>
                                }
                            >
                                <Table
                                    columns={recordColumns}
                                    dataSource={allRecords}
                                    rowKey="id"
                                    size="small"
                                    pagination={{
                                        pageSize: 50,
                                        showSizeChanger: true,
                                        pageSizeOptions: ["20", "50", "100"],
                                        showTotal: (total, range) =>
                                            `${range[0]}-${range[1]} / 총 ${total}개`,
                                    }}
                                    rowSelection={{
                                        selectedRowKeys: selected_record_keys,
                                        onChange: setSelectedRecordKeys,
                                    }}
                                    scroll={{ x: 1200 }}
                                />
                            </Card>
                        </Space>
                    )}

                    {/* 데이터 탐색기 탭 */}
                    {admin_tab === "explorer" && (
                        <Tabs
                            defaultActiveKey="records"
                            items={[
                                {
                                    key: "records",
                                    label: "레코드 탐색",
                                    children: (
                                        <RecordsExplorer
                                            records={records}
                                            time_format={time_format}
                                        />
                                    ),
                                },
                                {
                                    key: "sessions",
                                    label: "세션 탐색",
                                    children: (
                                        <SessionsExplorer
                                            records={records}
                                            time_format={time_format}
                                        />
                                    ),
                                },
                            ]}
                        />
                    )}

                    {/* 통계 대시보드 탭 */}
                    {admin_tab === "statistics" && (
                        <StatsDashboard
                            records={records}
                            time_format={time_format}
                        />
                    )}

                    {/* 휴지통 탭 */}
                    {admin_tab === "trash" && (
                        <TrashManager
                            records={records}
                            on_restore={(record_id) => {
                                updateRecord(record_id, {
                                    is_deleted: false,
                                    deleted_at: undefined,
                                });
                            }}
                            on_permanent_delete={(record_id) => {
                                permanentlyDeleteRecord(record_id);
                            }}
                            time_format={time_format}
                        />
                    )}

                    {/* 내보내기 탭 */}
                    {admin_tab === "export" && (
                        <ExportPanel
                            records={records}
                            time_format={time_format}
                        />
                    )}

                    {/* 정합성 검사 탭 */}
                    {admin_tab === "integrity" && (
                        <IntegrityChecker
                            records={records}
                            on_fix_time_mismatch={(record_id, new_duration) => {
                                updateRecord(record_id, {
                                    duration_minutes: new_duration,
                                });
                            }}
                            on_delete_session={(record_id, session_id) => {
                                deleteSession(record_id, session_id);
                            }}
                        />
                    )}
                </Card>

                {/* 레코드 상세 정보 모달 */}
                <Modal
                    title={
                        <Space>
                            <FileTextOutlined />
                            <span>레코드 상세 데이터</span>
                        </Space>
                    }
                    open={!!detail_modal_record}
                    onCancel={() => setDetailModalRecord(null)}
                    width={800}
                    footer={[
                        <Button
                            key="copy"
                            icon={<CopyOutlined />}
                            onClick={() => {
                                if (detail_modal_record) {
                                    handleCopyRecordData([
                                        detail_modal_record.id,
                                    ]);
                                }
                            }}
                        >
                            JSON 복사
                        </Button>,
                        <Button
                            key="close"
                            onClick={() => setDetailModalRecord(null)}
                        >
                            닫기
                        </Button>,
                    ]}
                >
                    {detail_modal_record && (
                        <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                        >
                            <Descriptions
                                bordered
                                size="small"
                                column={2}
                                title="기본 정보"
                            >
                                <Descriptions.Item label="ID" span={2}>
                                    <Text
                                        copyable
                                        code
                                        style={{ fontSize: 11 }}
                                    >
                                        {detail_modal_record.id}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="날짜">
                                    {detail_modal_record.date}
                                </Descriptions.Item>
                                <Descriptions.Item label="프로젝트 코드">
                                    {detail_modal_record.project_code}
                                </Descriptions.Item>
                                <Descriptions.Item label="작업명" span={2}>
                                    {detail_modal_record.work_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="거래명" span={2}>
                                    {detail_modal_record.deal_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="업무명">
                                    {detail_modal_record.task_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="카테고리">
                                    {detail_modal_record.category_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="소요시간">
                                    {formatDuration(
                                        detail_modal_record.duration_minutes ||
                                            0,
                                        time_format
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="시간">
                                    {detail_modal_record.start_time || "-"} ~{" "}
                                    {detail_modal_record.end_time || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="완료 여부">
                                    {detail_modal_record.is_completed ? (
                                        <Tag color="green">완료</Tag>
                                    ) : (
                                        <Tag>미완료</Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="세션 수">
                                    {detail_modal_record.sessions?.length || 0}
                                    개
                                </Descriptions.Item>
                                {detail_modal_record.note && (
                                    <Descriptions.Item label="비고" span={2}>
                                        {detail_modal_record.note}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* 세션 목록 */}
                            {detail_modal_record.sessions &&
                                detail_modal_record.sessions.length > 0 && (
                                    <Card size="small" title="세션 이력">
                                        <Table
                                            columns={[
                                                {
                                                    title: "#",
                                                    width: 50,
                                                    render: (_, __, idx) =>
                                                        idx + 1,
                                                },
                                                {
                                                    title: "날짜",
                                                    dataIndex: "date",
                                                    width: 110,
                                                    render: (date) =>
                                                        date ||
                                                        detail_modal_record.date,
                                                },
                                                {
                                                    title: "시작",
                                                    dataIndex: "start_time",
                                                    width: 80,
                                                },
                                                {
                                                    title: "종료",
                                                    dataIndex: "end_time",
                                                    width: 80,
                                                },
                                                {
                                                    title: "소요시간",
                                                    dataIndex:
                                                        "duration_minutes",
                                                    width: 90,
                                                    render: (mins: number) =>
                                                        formatDuration(
                                                            mins || 0,
                                                            time_format
                                                        ),
                                                },
                                                {
                                                    title: "ID",
                                                    dataIndex: "id",
                                                    ellipsis: true,
                                                    render: (id: string) => (
                                                        <Text
                                                            copyable
                                                            code
                                                            style={{
                                                                fontSize: 10,
                                                            }}
                                                        >
                                                            {id}
                                                        </Text>
                                                    ),
                                                },
                                            ]}
                                            dataSource={
                                                detail_modal_record.sessions
                                            }
                                            rowKey="id"
                                            size="small"
                                            pagination={false}
                                        />
                                    </Card>
                                )}

                            {/* Raw JSON */}
                            <Card size="small" title="Raw JSON">
                                <pre
                                    style={{
                                        background: "#f5f5f5",
                                        padding: 12,
                                        borderRadius: 4,
                                        fontSize: 11,
                                        maxHeight: 300,
                                        overflow: "auto",
                                        margin: 0,
                                    }}
                                >
                                    {JSON.stringify(
                                        detail_modal_record,
                                        null,
                                        2
                                    )}
                                </pre>
                            </Card>
                        </Space>
                    )}
                </Modal>

                {/* 레코드 병합 확인 모달 */}
                <Modal
                    title={
                        <Space>
                            <MergeCellsOutlined />
                            <span>레코드 병합 확인</span>
                        </Space>
                    }
                    open={merge_modal_open}
                    onCancel={() => {
                        setMergeModalOpen(false);
                        setMergeTargetGroup(null);
                    }}
                    onOk={handleMergeRecords}
                    okText="병합 실행"
                    okButtonProps={{ danger: true }}
                    cancelText="취소"
                    width={900}
                >
                    {merge_target_group && (
                        <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                        >
                            <Alert
                                type="warning"
                                message="주의: 병합은 되돌릴 수 없습니다!"
                                description={
                                    <>
                                        <p>
                                            <strong>
                                                {
                                                    merge_target_group.records
                                                        .length
                                                }
                                                개
                                            </strong>{" "}
                                            레코드가 <strong>1개</strong>로
                                            병합됩니다.
                                        </p>
                                        <p>
                                            첫 번째 레코드를 기준으로 모든
                                            세션이 합쳐지고, 나머지 레코드는
                                            삭제됩니다.
                                        </p>
                                    </>
                                }
                                showIcon
                            />

                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="작업명" span={2}>
                                    {merge_target_group.work_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="거래명" span={2}>
                                    {merge_target_group.deal_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="병합 대상 레코드">
                                    {merge_target_group.records.length}개
                                </Descriptions.Item>
                                <Descriptions.Item label="총 세션 수">
                                    {merge_target_group.total_sessions}개
                                </Descriptions.Item>
                                <Descriptions.Item label="총 소요시간">
                                    {formatDuration(
                                        merge_target_group.total_duration || 0,
                                        time_format
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="날짜 범위">
                                    {merge_target_group.date_range}
                                </Descriptions.Item>
                            </Descriptions>

                            <Card size="small" title="병합될 레코드 목록">
                                <Table
                                    columns={[
                                        {
                                            title: "#",
                                            width: 50,
                                            render: (_, __, idx) => (
                                                <Tag
                                                    color={
                                                        idx === 0
                                                            ? "green"
                                                            : "default"
                                                    }
                                                >
                                                    {idx === 0
                                                        ? "기준"
                                                        : idx + 1}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: "날짜",
                                            dataIndex: "date",
                                            width: 110,
                                        },
                                        {
                                            title: "프로젝트",
                                            dataIndex: "project_code",
                                            width: 120,
                                        },
                                        {
                                            title: "세션",
                                            width: 70,
                                            render: (_, record) =>
                                                `${
                                                    record.sessions?.length || 0
                                                }개`,
                                        },
                                        {
                                            title: "소요시간",
                                            dataIndex: "duration_minutes",
                                            width: 90,
                                            render: (mins: number) =>
                                                formatDuration(
                                                    mins || 0,
                                                    time_format
                                                ),
                                        },
                                        {
                                            title: "시간",
                                            width: 130,
                                            render: (_, record) =>
                                                `${
                                                    record.start_time || "-"
                                                } ~ ${record.end_time || "-"}`,
                                        },
                                        {
                                            title: "상태",
                                            width: 80,
                                            render: (_, record) =>
                                                record.is_completed ? (
                                                    <Tag color="green">
                                                        완료
                                                    </Tag>
                                                ) : (
                                                    <Tag>미완료</Tag>
                                                ),
                                        },
                                    ]}
                                    dataSource={merge_target_group.records}
                                    rowKey="id"
                                    size="small"
                                    pagination={false}
                                />
                            </Card>
                        </Space>
                    )}
                </Modal>
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
