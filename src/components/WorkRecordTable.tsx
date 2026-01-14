import { useState, useMemo, useEffect } from "react";
import {
    Table,
    Card,
    DatePicker,
    TimePicker,
    Button,
    Popconfirm,
    Space,
    Typography,
    Tag,
    Statistic,
    Row,
    Col,
    Modal,
    Form,
    Input,
    Select,
    Tooltip,
    AutoComplete,
    Divider,
    message,
} from "antd";
import {
    DeleteOutlined,
    CopyOutlined,
    ClockCircleOutlined,
    HistoryOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    PlusOutlined,
    EditOutlined,
    CheckOutlined,
    RollbackOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../store/useWorkStore";
import type { WorkRecord, WorkSession } from "../types";

const { Text } = Typography;

// 초를 읽기 쉬운 형식으로 변환
const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}초`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) {
        return `${mins}분`;
    }
    return `${mins}분 ${secs}초`;
};

// 타이머 표시 형식 (HH:MM:SS)
const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 세션의 duration을 초 단위로 가져오기 (기존 데이터 호환)
const getSessionDurationSeconds = (session: WorkSession): number => {
    if (
        session.duration_seconds !== undefined &&
        !isNaN(session.duration_seconds)
    ) {
        return session.duration_seconds;
    }
    const legacy = session as unknown as { duration_minutes?: number };
    if (
        legacy.duration_minutes !== undefined &&
        !isNaN(legacy.duration_minutes)
    ) {
        return legacy.duration_minutes * 60;
    }
    return 0;
};

// 레코드의 duration_minutes 가져오기 (NaN 처리)
const getRecordDurationMinutes = (record: WorkRecord): number => {
    if (
        record.duration_minutes !== undefined &&
        !isNaN(record.duration_minutes) &&
        record.duration_minutes > 0
    ) {
        return record.duration_minutes;
    }
    if (record.sessions && record.sessions.length > 0) {
        const total_seconds = record.sessions.reduce(
            (sum, s) => sum + getSessionDurationSeconds(s),
            0
        );
        if (total_seconds > 0) {
            return Math.max(1, Math.ceil(total_seconds / 60));
        }
    }
    if (record.start_time && record.end_time) {
        const start = dayjs(`2000-01-01 ${record.start_time}`);
        const end = dayjs(`2000-01-01 ${record.end_time}`);
        const diff_seconds = end.diff(start, "second");
        if (diff_seconds > 0) {
            return Math.max(1, Math.ceil(diff_seconds / 60));
        }
    }
    return 0;
};

export default function WorkRecordTable() {
    const {
        records,
        selected_date,
        setSelectedDate,
        deleteRecord,
        updateRecord,
        updateSession,
        deleteSession,
        timer,
        startTimer,
        stopTimer,
        switchTemplate,
        setFormData,
        getElapsedSeconds,
        syncFromStorage,
        templates,
        getAutoCompleteOptions,
        getCompletedRecords,
        markAsCompleted,
        markAsIncomplete,
        custom_task_options,
        custom_category_options,
        addCustomTaskOption,
        addCustomCategoryOption,
    } = useWorkStore();

    // 타이머 표시를 위한 리렌더링 트리거
    const [, setTick] = useState(0);

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [is_completed_modal_open, setIsCompletedModalOpen] = useState(false);
    const [is_session_edit_modal_open, setIsSessionEditModalOpen] = useState(false);
    const [editing_record, setEditingRecord] = useState<WorkRecord | null>(
        null
    );
    const [editing_session, setEditingSession] = useState<{
        record_id: string;
        session: WorkSession;
    } | null>(null);
    const [session_start_time, setSessionStartTime] = useState<string>("");
    const [session_end_time, setSessionEndTime] = useState<string>("");
    const [form] = Form.useForm();
    const [edit_form] = Form.useForm();
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");
    const [edit_task_input, setEditTaskInput] = useState("");
    const [edit_category_input, setEditCategoryInput] = useState("");

    // 작업명/거래명 자동완성 옵션 (records, templates 변경 시 갱신)
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({ value: v }));
    }, [records, templates, getAutoCompleteOptions]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({ value: v }));
    }, [records, templates, getAutoCompleteOptions]);

    // 업무명/카테고리명 옵션 (기본 + 사용자 정의)
    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_task_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_category_options]);

    // 업무명/카테고리명 추가 핸들러
    const handleAddTaskOption = () => {
        if (new_task_input.trim()) {
            addCustomTaskOption(new_task_input.trim());
            setNewTaskInput("");
        }
    };

    const handleAddCategoryOption = () => {
        if (new_category_input.trim()) {
            addCustomCategoryOption(new_category_input.trim());
            setNewCategoryInput("");
        }
    };

    // 타이머 UI 업데이트 (1초마다 리렌더링)
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer.is_running) {
            interval = setInterval(() => {
                setTick((t) => t + 1); // 리렌더링 트리거
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer.is_running]);

    // 다른 탭에서의 변경 감지 (LocalStorage 동기화)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "work-time-storage") {
                syncFromStorage();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [syncFromStorage]);

    // 오늘 날짜인지 확인
    const is_today = selected_date === dayjs().format("YYYY-MM-DD");

    // 선택된 날짜의 레코드 필터링 + 과거 미완료 작업 포함 + 진행 중인 작업 포함
    const filtered_records = useMemo(() => {
        // 미완료 작업: 선택된 날짜까지의 미완료 레코드
        const incomplete_records = records.filter((r) => {
            if (r.is_completed) return false;
            return r.date <= selected_date;
        });

        // 선택된 날짜의 완료된 레코드도 포함
        const completed_today = records.filter(
            (r) => r.date === selected_date && r.is_completed
        );

        const all_records = [...incomplete_records, ...completed_today];

        // 진행 중인 작업이 있고, 오늘 날짜인 경우
        const active_form = timer.active_form_data;
        if (timer.is_running && is_today && active_form?.work_name) {
            // 이미 저장된 레코드에 같은 작업이 있는지 확인
            const existing = all_records.find(
                (r) =>
                    r.work_name === active_form.work_name &&
                    r.deal_name === active_form.deal_name
            );

            // 없으면 진행 중인 작업을 가상 레코드로 추가
            if (!existing) {
                const virtual_record: WorkRecord = {
                    id: "__active__",
                    work_name: active_form.work_name,
                    task_name: active_form.task_name,
                    deal_name: active_form.deal_name,
                    category_name: active_form.category_name,
                    note: active_form.note,
                    duration_minutes: 0,
                    start_time: timer.start_time
                        ? dayjs(timer.start_time).format("HH:mm:ss")
                        : "",
                    end_time: "",
                    date: selected_date,
                    sessions: [],
                    is_completed: false,
                };
                return [virtual_record, ...all_records];
            }
        }

        // 날짜 내림차순 정렬 (최신 날짜 먼저)
        return all_records.sort((a, b) => {
            // 완료된 것은 뒤로
            if (a.is_completed !== b.is_completed) {
                return a.is_completed ? 1 : -1;
            }
            // 같은 완료 상태면 날짜 비교
            return b.date.localeCompare(a.date);
        });
    }, [
        records,
        selected_date,
        timer.is_running,
        timer.start_time,
        timer.active_form_data,
        is_today,
    ]);

    // 총 시간 계산 (가상 레코드 제외)
    const total_minutes = useMemo(() => {
        return filtered_records
            .filter((r) => r.id !== "__active__")
            .reduce((sum, r) => sum + getRecordDurationMinutes(r), 0);
    }, [filtered_records]);

    // 현재 작업 중인 레코드 찾기
    const getActiveRecordId = () => {
        if (!timer.is_running) return null;
        // 가상 레코드인 경우
        if (filtered_records.some((r) => r.id === "__active__")) {
            return "__active__";
        }
        // timer.active_form_data와 매칭되는 레코드 찾기
        const active_form = timer.active_form_data;
        if (!active_form) return null;
        const matching = filtered_records.find(
            (r) =>
                r.work_name === active_form.work_name &&
                r.deal_name === active_form.deal_name
        );
        return matching?.id || null;
    };

    // 클립보드 복사 (표 형식)
    const handleCopyToClipboard = () => {
        const header = "작업명\t업무명\t거래명\t카테고리명\t시간(분)\t비고";
        const rows = filtered_records.map(
            (r) =>
                `${r.work_name}\t${r.task_name}\t${r.deal_name}\t${
                    r.category_name
                }\t${getRecordDurationMinutes(r)}\t${r.note}`
        );
        const text = [header, ...rows].join("\n");
        navigator.clipboard.writeText(text);
    };

    // 작업 시작/중지 토글
    const handleToggleRecord = (record: WorkRecord) => {
        const is_active = getActiveRecordId() === record.id;

        if (is_active) {
            // 현재 작업 중지
            stopTimer();
        } else if (timer.is_running) {
            // 다른 작업으로 전환
            // 매칭되는 템플릿 찾기
            const template = templates.find(
                (t) =>
                    t.work_name === record.work_name &&
                    t.deal_name === record.deal_name
            );
            if (template) {
                switchTemplate(template.id);
            } else {
                // 템플릿 없으면 직접 form_data 설정 후 전환
                stopTimer();
                setFormData({
                    work_name: record.work_name,
                    task_name: record.task_name,
                    deal_name: record.deal_name,
                    category_name: record.category_name,
                    note: record.note,
                });
                startTimer();
            }
        } else {
            // 새로 시작
            setFormData({
                work_name: record.work_name,
                task_name: record.task_name,
                deal_name: record.deal_name,
                category_name: record.category_name,
                note: record.note,
            });
            startTimer();
        }
    };

    // 새 작업 추가
    const handleAddNewWork = async () => {
        try {
            const values = await form.validateFields();
            setFormData({
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            });

            // 기존 타이머 중지 후 새 타이머 시작
            if (timer.is_running) {
                stopTimer();
            }
            startTimer();

            form.resetFields();
            setIsModalOpen(false);
        } catch {
            // validation failed
        }
    };

    // 수정 모달 열기
    const handleOpenEditModal = (record: WorkRecord) => {
        setEditingRecord(record);
        edit_form.setFieldsValue({
            work_name: record.work_name,
            task_name: record.task_name,
            deal_name: record.deal_name,
            category_name: record.category_name,
            note: record.note,
        });
        setIsEditModalOpen(true);
    };

    // 수정 저장
    const handleSaveEdit = async () => {
        if (!editing_record) return;
        try {
            const values = await edit_form.validateFields();
            updateRecord(editing_record.id, {
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            });
            edit_form.resetFields();
            setEditingRecord(null);
            setIsEditModalOpen(false);
        } catch {
            // validation failed
        }
    };

    // 완료 처리
    const handleMarkComplete = (record: WorkRecord) => {
        markAsCompleted(record.id);
    };

    // 완료 취소
    const handleMarkIncomplete = (record: WorkRecord) => {
        markAsIncomplete(record.id);
    };

    // 완료된 작업 목록
    const completed_records = useMemo(() => {
        return getCompletedRecords();
    }, [records, getCompletedRecords]);

    // 세션 편집 모달 열기
    const openSessionEditModal = (record_id: string, session: WorkSession) => {
        setEditingSession({ record_id, session });
        setSessionStartTime(session.start_time);
        setSessionEndTime(session.end_time);
        setIsSessionEditModalOpen(true);
    };

    // 세션 편집 모달 닫기
    const closeSessionEditModal = () => {
        setIsSessionEditModalOpen(false);
        setEditingSession(null);
        setSessionStartTime("");
        setSessionEndTime("");
    };

    // 세션 시간 저장
    const handleSaveSessionTime = () => {
        if (!editing_session) return;
        
        const result = updateSession(
            editing_session.record_id,
            editing_session.session.id,
            session_start_time,
            session_end_time
        );
        
        if (result.success) {
            if (result.adjusted) {
                message.warning(
                    result.message || "시간이 자동 조정되었습니다."
                );
            } else {
                message.success("시간이 수정되었습니다.");
            }
            closeSessionEditModal();
        } else {
            message.error(result.message || "시간 수정에 실패했습니다.");
        }
    };

    // 세션 삭제 핸들러
    const handleDeleteSession = (record_id: string, session_id: string) => {
        deleteSession(record_id, session_id);
        message.success("세션이 삭제되었습니다.");
    };

    // 확장 행 렌더링 (세션 이력 + 시간 수정)
    const expandedRowRender = (record: WorkRecord) => {
        const sessions: WorkSession[] =
            record.sessions && record.sessions.length > 0
                ? record.sessions
                : [
                      {
                          id: record.id,
                          start_time: record.start_time,
                          end_time: record.end_time,
                          duration_seconds: record.duration_minutes * 60,
                      },
                  ];

        if (sessions.length === 0) {
            return (
                <div style={{ padding: "16px", color: "#999" }}>
                    세션 이력이 없습니다.
                </div>
            );
        }

        return (
            <div className="session-history">
                <div className="session-header">
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    <Text strong>작업 이력</Text>
                    <Text
                        type="secondary"
                        style={{ marginLeft: 8, fontSize: 12 }}
                    >
                        (총 {sessions.length}회 작업)
                    </Text>
                </div>

                <Table
                    dataSource={sessions}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    style={{ marginTop: 16 }}
                    columns={[
                        {
                            title: "#",
                            key: "index",
                            width: 40,
                            render: (
                                _: unknown,
                                __: WorkSession,
                                index: number
                            ) => <Text type="secondary">{index + 1}</Text>,
                        },
                        {
                            title: "시간",
                            key: "time_range",
                            width: 180,
                            render: (_: unknown, session: WorkSession) => (
                                <Text>
                                    {session.start_time} ~ {session.end_time}
                                </Text>
                            ),
                        },
                        {
                            title: "소요 시간",
                            key: "duration",
                            width: 100,
                            render: (_: unknown, session: WorkSession) => (
                                <Tag color="blue">
                                    {formatDuration(
                                        getSessionDurationSeconds(session)
                                    )}
                                </Tag>
                            ),
                        },
                        {
                            title: "",
                            key: "action",
                            width: 80,
                            render: (_: unknown, session: WorkSession) => (
                                <Space size="small">
                                    <Tooltip title="시간 수정">
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            size="small"
                                            onClick={() =>
                                                openSessionEditModal(
                                                    record.id,
                                                    session
                                                )
                                            }
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="세션 삭제"
                                        description="이 세션을 삭제하시겠습니까?"
                                    onConfirm={() =>
                                        handleDeleteSession(
                                            record.id,
                                            session.id
                                        )
                                    }
                                    okText="삭제"
                                    cancelText="취소"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                    />
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                />

                <div className="session-summary">
                    <Space split={<span style={{ color: "#d9d9d9" }}>|</span>}>
                        <Text type="secondary">
                            첫 시작: {record.start_time}
                        </Text>
                        <Text type="secondary">
                            마지막 종료: {record.end_time}
                        </Text>
                        <Text strong style={{ color: "#1890ff" }}>
                            총{" "}
                            {formatDuration(
                                sessions.reduce(
                                    (sum, s) =>
                                        sum + getSessionDurationSeconds(s),
                                    0
                                )
                            )}
                        </Text>
                    </Space>
                </div>

                <style>{`
                    .session-history { padding: 16px 24px; background: #fafafa; border-radius: 8px; }
                    .session-header { display: flex; align-items: center; margin-bottom: 8px; }
                    .session-summary { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e8e8e8; }
                `}</style>
            </div>
        );
    };

    const columns: ColumnsType<WorkRecord> = [
        {
            title: "",
            key: "timer_action",
            width: 50,
            align: "center",
            render: (_, record: WorkRecord) => {
                const is_active = getActiveRecordId() === record.id;
                return (
                    <Tooltip
                        title={
                            is_active
                                ? "정지"
                                : timer.is_running
                                ? "전환"
                                : "시작"
                        }
                    >
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
                            onClick={() => handleToggleRecord(record)}
                        />
                    </Tooltip>
                );
            },
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            width: 150,
            render: (text: string, record: WorkRecord) => {
                const is_active = getActiveRecordId() === record.id;
                const is_completed = record.is_completed;
                return (
                    <Space>
                        {is_completed && (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
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
                            {text}
                        </Text>
                        {is_active && (
                            <Tag color="processing" style={{ marginLeft: 4 }}>
                                {formatTimer(getElapsedSeconds())}
                            </Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "업무명",
            dataIndex: "task_name",
            key: "task_name",
            width: 80,
            render: (text: string) =>
                text ? <Tag color="blue">{text}</Tag> : "-",
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            width: 180,
            ellipsis: true,
            render: (text: string) => text || "-",
        },
        {
            title: "카테고리",
            dataIndex: "category_name",
            key: "category_name",
            width: 90,
            render: (text: string) => {
                const color_map: Record<string, string> = {
                    개발: "green",
                    문서작업: "orange",
                    회의: "purple",
                    환경세팅: "cyan",
                    코드리뷰: "magenta",
                    테스트: "blue",
                    기타: "default",
                };
                return text ? (
                    <Tag color={color_map[text] || "default"}>{text}</Tag>
                ) : (
                    "-"
                );
            },
        },
        {
            title: "시간",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            width: 60,
            align: "center",
            render: (_: number, record: WorkRecord) => (
                <Text strong style={{ color: "#1890ff" }}>
                    {getRecordDurationMinutes(record)}분
                </Text>
            ),
        },
        {
            title: "시작-종료",
            key: "time_range",
            width: 120,
            render: (_, record: WorkRecord) => (
                <Text type="secondary" style={{ fontSize: 11 }}>
                    {record.start_time?.slice(0, 5)} ~{" "}
                    {record.end_time?.slice(0, 5)}
                </Text>
            ),
        },
        {
            title: "날짜",
            dataIndex: "date",
            key: "date",
            width: 90,
            render: (text: string) => {
                const is_past = text < dayjs().format("YYYY-MM-DD");
                return (
                    <Text
                        type={is_past ? "warning" : "secondary"}
                        style={{ fontSize: 11 }}
                    >
                        {text === dayjs().format("YYYY-MM-DD")
                            ? "오늘"
                            : text.slice(5)}
                    </Text>
                );
            },
        },
        {
            title: "",
            key: "action",
            width: 120,
            render: (_, record: WorkRecord) => {
                // 가상 레코드(진행 중)는 액션 불가
                if (record.id === "__active__") {
                    return null;
                }
                return (
                    <Space size={4}>
                        {/* 완료/완료 취소 버튼 */}
                        {record.is_completed ? (
                            <Tooltip title="완료 취소">
                                <Button
                                    type="text"
                                    icon={<RollbackOutlined />}
                                    size="small"
                                    onClick={() => handleMarkIncomplete(record)}
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip title="완료">
                                <Button
                                    type="text"
                                    style={{ color: "#52c41a" }}
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => handleMarkComplete(record)}
                                />
                            </Tooltip>
                        )}
                        {/* 수정 버튼 */}
                        <Tooltip title="수정">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleOpenEditModal(record)}
                            />
                        </Tooltip>
                        {/* 삭제 버튼 */}
                        <Popconfirm
                            title="삭제 확인"
                            description="이 기록을 삭제하시겠습니까?"
                            onConfirm={() => deleteRecord(record.id)}
                            okText="삭제"
                            cancelText="취소"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <Card
                title={
                    <Space>
                        <ClockCircleOutlined />
                        <span>작업 기록</span>
                        {timer.is_running && timer.active_form_data && (
                            <Tag
                                color="processing"
                                icon={<ClockCircleOutlined spin />}
                            >
                                {timer.active_form_data.work_name} 진행 중
                            </Tag>
                        )}
                        {filtered_records.some(
                            (r) =>
                                r.date < dayjs().format("YYYY-MM-DD") &&
                                !r.is_completed
                        ) && <Tag color="warning">미완료 작업 있음</Tag>}
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            새 작업
                        </Button>
                        <Button
                            icon={<CheckCircleOutlined />}
                            onClick={() => setIsCompletedModalOpen(true)}
                        >
                            완료된 작업 ({completed_records.length})
                        </Button>
                        <DatePicker
                            value={dayjs(selected_date)}
                            onChange={(date) =>
                                setSelectedDate(
                                    date?.format("YYYY-MM-DD") ||
                                        dayjs().format("YYYY-MM-DD")
                                )
                            }
                            allowClear={false}
                        />
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleCopyToClipboard}
                            disabled={filtered_records.length === 0}
                        >
                            복사
                        </Button>
                    </Space>
                }
            >
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Statistic
                            title="오늘 작업 수"
                            value={filtered_records.length}
                            suffix="건"
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="총 작업 시간"
                            value={total_minutes}
                            suffix="분"
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="시간 환산"
                            value={(total_minutes / 60).toFixed(1)}
                            suffix="시간"
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filtered_records}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 900 }}
                    expandable={{
                        expandedRowRender,
                        rowExpandable: () => true,
                    }}
                    rowClassName={(record) =>
                        getActiveRecordId() === record.id ? "active-row" : ""
                    }
                    locale={{
                        emptyText:
                            "작업 기록이 없습니다. 프리셋에서 작업을 추가하거나 새 작업을 시작하세요.",
                    }}
                />
            </Card>

            <Modal
                title="새 작업 시작"
                open={is_modal_open}
                onOk={handleAddNewWork}
                onCancel={() => {
                    form.resetFields();
                    setIsModalOpen(false);
                }}
                okText="시작"
                cancelText="취소"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[
                            { required: true, message: "작업명을 입력하세요" },
                        ]}
                    >
                        <AutoComplete
                            options={work_name_options}
                            placeholder="예: 5.6 프레임워크 FE"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item name="deal_name" label="거래명 (상세 작업)">
                        <AutoComplete
                            options={deal_name_options}
                            placeholder="예: 5.6 테스트 케이스 확인 및 이슈 처리"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="middle">
                        <Form.Item
                            name="task_name"
                            label="업무명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="업무 선택"
                                options={task_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                        >
                                            <Input
                                                placeholder="새 업무명"
                                                value={new_task_input}
                                                onChange={(e) =>
                                                    setNewTaskInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddTaskOption}
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                        <Form.Item
                            name="category_name"
                            label="카테고리"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                        >
                                            <Input
                                                placeholder="새 카테고리"
                                                value={new_category_input}
                                                onChange={(e) =>
                                                    setNewCategoryInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={
                                                    handleAddCategoryOption
                                                }
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item name="note" label="비고">
                        <Input.TextArea placeholder="추가 메모" rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 수정 모달 */}
            <Modal
                title="작업 수정"
                open={is_edit_modal_open}
                onOk={handleSaveEdit}
                onCancel={() => {
                    edit_form.resetFields();
                    setEditingRecord(null);
                    setIsEditModalOpen(false);
                }}
                okText="저장"
                cancelText="취소"
            >
                <Form form={edit_form} layout="vertical">
                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[
                            { required: true, message: "작업명을 입력하세요" },
                        ]}
                    >
                        <AutoComplete
                            options={work_name_options}
                            placeholder="예: 5.6 프레임워크 FE"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item name="deal_name" label="거래명 (상세 작업)">
                        <AutoComplete
                            options={deal_name_options}
                            placeholder="예: 5.6 테스트 케이스 확인 및 이슈 처리"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="middle">
                        <Form.Item
                            name="task_name"
                            label="업무명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="업무 선택"
                                options={task_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                        >
                                            <Input
                                                placeholder="새 업무명"
                                                value={edit_task_input}
                                                onChange={(e) =>
                                                    setEditTaskInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={() => {
                                                    if (
                                                        edit_task_input.trim()
                                                    ) {
                                                        addCustomTaskOption(
                                                            edit_task_input.trim()
                                                        );
                                                        setEditTaskInput("");
                                                    }
                                                }}
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                        <Form.Item
                            name="category_name"
                            label="카테고리"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                        >
                                            <Input
                                                placeholder="새 카테고리"
                                                value={edit_category_input}
                                                onChange={(e) =>
                                                    setEditCategoryInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={() => {
                                                    if (
                                                        edit_category_input.trim()
                                                    ) {
                                                        addCustomCategoryOption(
                                                            edit_category_input.trim()
                                                        );
                                                        setEditCategoryInput(
                                                            ""
                                                        );
                                                    }
                                                }}
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item name="note" label="비고">
                        <Input.TextArea placeholder="추가 메모" rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 완료된 작업 조회 모달 */}
            <Modal
                title={
                    <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <span>완료된 작업 목록</span>
                        <Tag color="success">{completed_records.length}건</Tag>
                    </Space>
                }
                open={is_completed_modal_open}
                onCancel={() => setIsCompletedModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsCompletedModalOpen(false)}
                    >
                        닫기
                    </Button>,
                ]}
                width={800}
            >
                <Table
                    dataSource={completed_records}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    columns={[
                        {
                            title: "작업명",
                            dataIndex: "work_name",
                            key: "work_name",
                            width: 150,
                            render: (text: string) => (
                                <Text strong>{text}</Text>
                            ),
                        },
                        {
                            title: "거래명",
                            dataIndex: "deal_name",
                            key: "deal_name",
                            width: 200,
                            ellipsis: true,
                            render: (text: string) => text || "-",
                        },
                        {
                            title: "시간",
                            key: "duration",
                            width: 60,
                            render: (_: unknown, record: WorkRecord) => (
                                <Text style={{ color: "#1890ff" }}>
                                    {getRecordDurationMinutes(record)}분
                                </Text>
                            ),
                        },
                        {
                            title: "작업일",
                            dataIndex: "date",
                            key: "date",
                            width: 100,
                        },
                        {
                            title: "완료일",
                            key: "completed_at",
                            width: 120,
                            render: (_: unknown, record: WorkRecord) =>
                                record.completed_at
                                    ? dayjs(record.completed_at).format(
                                          "YYYY-MM-DD HH:mm"
                                      )
                                    : "-",
                        },
                        {
                            title: "",
                            key: "action",
                            width: 80,
                            render: (_: unknown, record: WorkRecord) => (
                                <Space>
                                    <Tooltip title="되돌리기">
                                        <Button
                                            type="text"
                                            icon={<RollbackOutlined />}
                                            size="small"
                                            onClick={() =>
                                                handleMarkIncomplete(record)
                                            }
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="삭제 확인"
                                        description="이 기록을 삭제하시겠습니까?"
                                        onConfirm={() =>
                                            deleteRecord(record.id)
                                        }
                                        okText="삭제"
                                        cancelText="취소"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            size="small"
                                        />
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                    locale={{
                        emptyText: "완료된 작업이 없습니다.",
                    }}
                />
            </Modal>

            {/* 세션 시간 수정 모달 */}
            <Modal
                title="세션 시간 수정"
                open={is_session_edit_modal_open}
                onOk={handleSaveSessionTime}
                onCancel={closeSessionEditModal}
                okText="저장"
                cancelText="취소"
                width={400}
            >
                {editing_session && (
                    <Space
                        direction="vertical"
                        size="middle"
                        style={{ width: "100%" }}
                    >
                        <div>
                            <Text
                                type="secondary"
                                style={{ display: "block", marginBottom: 8 }}
                            >
                                시작 시간
                            </Text>
                            <TimePicker
                                value={dayjs(session_start_time, "HH:mm:ss")}
                                format="HH:mm:ss"
                                style={{ width: "100%" }}
                                allowClear={false}
                                onChange={(time) => {
                                    if (time) {
                                        setSessionStartTime(
                                            time.format("HH:mm:ss")
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <Text
                                type="secondary"
                                style={{ display: "block", marginBottom: 8 }}
                            >
                                종료 시간
                            </Text>
                            <TimePicker
                                value={dayjs(session_end_time, "HH:mm:ss")}
                                format="HH:mm:ss"
                                style={{ width: "100%" }}
                                allowClear={false}
                                onChange={(time) => {
                                    if (time) {
                                        setSessionEndTime(
                                            time.format("HH:mm:ss")
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div
                            style={{
                                padding: "8px 12px",
                                background: "#f5f5f5",
                                borderRadius: 4,
                            }}
                        >
                            <Text type="secondary">예상 소요 시간: </Text>
                            <Text strong style={{ color: "#1890ff" }}>
                                {(() => {
                                    const start = dayjs(
                                        session_start_time,
                                        "HH:mm:ss"
                                    );
                                    const end = dayjs(
                                        session_end_time,
                                        "HH:mm:ss"
                                    );
                                    const diff_seconds = end.diff(
                                        start,
                                        "second"
                                    );
                                    if (diff_seconds <= 0) return "유효하지 않음";
                                    return formatDuration(diff_seconds);
                                })()}
                            </Text>
                        </div>
                    </Space>
                )}
            </Modal>

            <style>{`
                .active-row {
                    background-color: #e6f7ff !important;
                }
                .active-row:hover > td {
                    background-color: #bae7ff !important;
                }
            `}</style>
        </>
    );
}
