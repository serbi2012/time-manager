import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { InputRef } from "antd";
import {
    Table,
    Card,
    DatePicker,
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
    DownOutlined,
    UndoOutlined,
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

// 타이머 표시 형식 (HH:MM)
const formatTimer = (seconds: number): string => {
    const total_mins = Math.floor(seconds / 60);
    const hrs = Math.floor(total_mins / 60);
    const mins = total_mins % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
};

// 세션의 duration을 분 단위로 가져오기 (기존 데이터 호환)
const getSessionDurationMinutes = (session: WorkSession): number => {
    if (
        session.duration_minutes !== undefined &&
        !isNaN(session.duration_minutes)
    ) {
        return session.duration_minutes;
    }
    // 기존 데이터는 duration_seconds 필드가 있을 수 있음
    const legacy = session as unknown as { duration_seconds?: number };
    if (
        legacy.duration_seconds !== undefined &&
        !isNaN(legacy.duration_seconds)
    ) {
        return Math.ceil(legacy.duration_seconds / 60);
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
        const total_minutes = record.sessions.reduce(
            (sum, s) => sum + getSessionDurationMinutes(s),
            0
        );
        if (total_minutes > 0) {
            return Math.max(1, total_minutes);
        }
    }
    if (record.start_time && record.end_time) {
        const start = dayjs(`2000-01-01 ${record.start_time}`);
        const end = dayjs(`2000-01-01 ${record.end_time}`);
        const diff_minutes = end.diff(start, "minute");
        if (diff_minutes > 0) {
            return Math.max(1, diff_minutes);
        }
    }
    return 0;
};

// 특정 날짜의 세션들만 시간 합산
const getRecordDurationMinutesForDate = (
    record: WorkRecord,
    target_date: string
): number => {
    if (!record.sessions || record.sessions.length === 0) {
        // 세션이 없으면 레코드 날짜가 맞는 경우만 전체 시간 반환
        if (record.date === target_date) {
            return getRecordDurationMinutes(record);
        }
        return 0;
    }

    // 해당 날짜의 세션들만 필터링하여 시간 합산
    const date_sessions = record.sessions.filter(
        (s) => (s.date || record.date) === target_date
    );

    if (date_sessions.length === 0) {
        return 0;
    }

    return date_sessions.reduce(
        (sum, s) => sum + getSessionDurationMinutes(s),
        0
    );
};

// 특정 날짜의 시작/종료 시간 가져오기
const getTimeRangeForDate = (
    record: WorkRecord,
    target_date: string
): { start_time: string; end_time: string } => {
    if (!record.sessions || record.sessions.length === 0) {
        // 세션이 없으면 레코드 날짜가 맞는 경우만 레코드 시간 반환
        if (record.date === target_date) {
            return {
                start_time: record.start_time || "",
                end_time: record.end_time || "",
            };
        }
        return { start_time: "", end_time: "" };
    }

    // 해당 날짜의 세션들만 필터링
    const date_sessions = record.sessions.filter(
        (s) => (s.date || record.date) === target_date
    );

    if (date_sessions.length === 0) {
        return { start_time: "", end_time: "" };
    }

    // 시간순 정렬
    const sorted = [...date_sessions].sort((a, b) => {
        const a_start = a.start_time || "00:00";
        const b_start = b.start_time || "00:00";
        return a_start.localeCompare(b_start);
    });

    return {
        start_time: sorted[0].start_time || "",
        end_time: sorted[sorted.length - 1].end_time || "",
    };
};

// 세션 시간 편집용 Input 컴포넌트 (로컬 상태로 리렌더링 문제 해결)
interface TimeInputProps {
    value: string;
    onSave: (new_time: string) => void;
}

function TimeInput({ value, onSave }: TimeInputProps) {
    const [edit_value, setEditValue] = useState<string | null>(null);
    const is_editing = edit_value !== null;

    const handleFocus = () => {
        setEditValue(value);
    };

    const handleBlur = () => {
        if (edit_value === null) return;

        // 시간 형식 검증 (HH:mm)
        const time_regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (time_regex.test(edit_value) && edit_value !== value) {
            onSave(edit_value);
        }
        setEditValue(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
            setEditValue(null);
        }
    };

    return (
        <Input
            value={is_editing ? edit_value : value}
            onChange={(e) => setEditValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            size="small"
            style={{ width: 70, fontFamily: "monospace" }}
            placeholder="HH:mm"
        />
    );
}

// 세션 날짜 편집용 Input 컴포넌트
interface DateInputProps {
    value: string;
    onSave: (new_date: string) => void;
}

function DateInput({ value, onSave }: DateInputProps) {
    const [edit_value, setEditValue] = useState<string | null>(null);
    const is_editing = edit_value !== null;

    const handleFocus = () => {
        setEditValue(value);
    };

    const handleBlur = () => {
        if (edit_value === null) return;

        // 날짜 형식 검증 (YYYY-MM-DD)
        const date_regex = /^\d{4}-\d{2}-\d{2}$/;
        if (
            date_regex.test(edit_value) &&
            dayjs(edit_value).isValid() &&
            edit_value !== value
        ) {
            onSave(edit_value);
        }
        setEditValue(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
            setEditValue(null);
        }
    };

    return (
        <Input
            value={is_editing ? edit_value : value}
            onChange={(e) => setEditValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            size="small"
            style={{ width: 100, fontFamily: "monospace" }}
            placeholder="YYYY-MM-DD"
        />
    );
}

// 세션 편집 테이블 (타이머 리렌더링과 독립적으로 동작)
// record_id만 받고 직접 스토어에서 레코드를 구독하여 불필요한 리렌더링 방지
interface SessionEditTableProps {
    record_id: string;
}

function SessionEditTable({ record_id }: SessionEditTableProps) {
    // 직접 스토어에서 레코드와 액션 구독
    const record = useWorkStore((state) =>
        state.records.find((r) => r.id === record_id)
    );
    const updateSession = useWorkStore((state) => state.updateSession);
    const deleteSession = useWorkStore((state) => state.deleteSession);

    // 시간 변경 핸들러
    const handleUpdateTime = useCallback(
        (session_id: string, new_start: string, new_end: string) => {
            const result = updateSession(
                record_id,
                session_id,
                new_start,
                new_end
            );
            if (result.success) {
                if (result.adjusted) {
                    message.warning(
                        result.message || "시간이 자동 조정되었습니다."
                    );
                } else {
                    message.success("시간이 수정되었습니다.");
                }
            } else {
                message.error(result.message || "시간 수정에 실패했습니다.");
            }
        },
        [record_id, updateSession]
    );

    // 날짜 변경 핸들러 (충돌 시 자동 조정 없이 알럿만)
    const handleUpdateDate = useCallback(
        (session: WorkSession, new_date: string) => {
            const result = updateSession(
                record_id,
                session.id,
                session.start_time,
                session.end_time,
                new_date
            );
            if (result.success) {
                message.success("날짜가 변경되었습니다.");
            } else {
                message.error(result.message || "날짜 변경에 실패했습니다.");
            }
        },
        [record_id, updateSession]
    );

    const handleDeleteSession = useCallback(
        (session_id: string) => {
            deleteSession(record_id, session_id);
            message.success("세션이 삭제되었습니다.");
        },
        [record_id, deleteSession]
    );

    if (!record) {
        return (
            <div style={{ padding: "16px", color: "#999" }}>
                레코드를 찾을 수 없습니다.
            </div>
        );
    }

    const sessions: WorkSession[] =
        record.sessions && record.sessions.length > 0
            ? record.sessions
            : [
                  {
                      id: record.id,
                      date: record.date,
                      start_time: record.start_time,
                      end_time: record.end_time,
                      duration_minutes: record.duration_minutes,
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
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
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
                        title: "날짜",
                        key: "date",
                        width: 120,
                        render: (_: unknown, session: WorkSession) => (
                            <DateInput
                                value={session.date || record.date}
                                onSave={(new_date) =>
                                    handleUpdateDate(session, new_date)
                                }
                            />
                        ),
                    },
                    {
                        title: "시작 시간",
                        key: "start_time",
                        width: 110,
                        render: (_: unknown, session: WorkSession) => (
                            <TimeInput
                                value={session.start_time}
                                onSave={(new_time) =>
                                    handleUpdateTime(
                                        session.id,
                                        new_time,
                                        session.end_time
                                    )
                                }
                            />
                        ),
                    },
                    {
                        title: "종료 시간",
                        key: "end_time",
                        width: 110,
                        render: (_: unknown, session: WorkSession) => (
                            <TimeInput
                                value={session.end_time}
                                onSave={(new_time) =>
                                    handleUpdateTime(
                                        session.id,
                                        session.start_time,
                                        new_time
                                    )
                                }
                            />
                        ),
                    },
                    {
                        title: "소요 시간",
                        key: "duration",
                        width: 100,
                        render: (_: unknown, session: WorkSession) => (
                            <Tag color="blue">
                                {formatDuration(
                                    getSessionDurationMinutes(session)
                                )}
                            </Tag>
                        ),
                    },
                    {
                        title: "",
                        key: "action",
                        width: 40,
                        render: (_: unknown, session: WorkSession) => (
                            <Popconfirm
                                title="세션 삭제"
                                description="이 세션을 삭제하시겠습니까?"
                                onConfirm={() =>
                                    handleDeleteSession(session.id)
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
                        ),
                    },
                ]}
            />

            <div className="session-summary">
                <Space split={<span style={{ color: "#d9d9d9" }}>|</span>}>
                    <Text type="secondary">첫 시작: {record.start_time}</Text>
                    <Text type="secondary">마지막 종료: {record.end_time}</Text>
                    <Text strong style={{ color: "#1890ff" }}>
                        총{" "}
                        {formatDuration(
                            sessions.reduce(
                                (sum, s) => sum + getSessionDurationMinutes(s),
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
}

export default function WorkRecordTable() {
    const {
        records,
        selected_date,
        setSelectedDate,
        softDeleteRecord,
        restoreRecord,
        permanentlyDeleteRecord,
        getDeletedRecords,
        updateRecord,
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
        getProjectCodeOptions,
    } = useWorkStore();

    // 타이머 표시를 위한 리렌더링 트리거
    const [, setTick] = useState(0);

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [is_completed_modal_open, setIsCompletedModalOpen] = useState(false);
    const [is_deleted_modal_open, setIsDeletedModalOpen] = useState(false);
    const [editing_record, setEditingRecord] = useState<WorkRecord | null>(
        null
    );
    const [form] = Form.useForm();
    const [edit_form] = Form.useForm();
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");
    const [edit_task_input, setEditTaskInput] = useState("");
    const [edit_category_input, setEditCategoryInput] = useState("");

    // Input refs for focus management
    const new_task_input_ref = useRef<InputRef>(null);
    const new_category_input_ref = useRef<InputRef>(null);
    const edit_task_input_ref = useRef<InputRef>(null);
    const edit_category_input_ref = useRef<InputRef>(null);

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
        // 미완료 작업: 선택된 날짜까지의 미완료 레코드 (삭제된 것 제외)
        const incomplete_records = records.filter((r) => {
            if (r.is_deleted) return false;
            if (r.is_completed) return false;
            return r.date <= selected_date;
        });

        // 선택된 날짜의 완료된 레코드도 포함 (삭제된 것 제외)
        const completed_today = records.filter(
            (r) => r.date === selected_date && r.is_completed && !r.is_deleted
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
                    project_code: active_form.project_code || "A00_00000",
                    work_name: active_form.work_name,
                    task_name: active_form.task_name,
                    deal_name: active_form.deal_name,
                    category_name: active_form.category_name,
                    note: active_form.note,
                    duration_minutes: 0,
                    start_time: timer.start_time
                        ? dayjs(timer.start_time).format("HH:mm")
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

    // 총 시간 계산 (가상 레코드 제외, 선택된 날짜의 세션만 합산)
    const total_minutes = useMemo(() => {
        return filtered_records
            .filter((r) => r.id !== "__active__")
            .reduce(
                (sum, r) =>
                    sum + getRecordDurationMinutesForDate(r, selected_date),
                0
            );
    }, [filtered_records, selected_date]);

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
                project_code: values.project_code || "",
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
            project_code: record.project_code || "",
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
                project_code: values.project_code || "",
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

    // 삭제된 작업 목록
    const deleted_records = useMemo(() => {
        return getDeletedRecords();
    }, [records, getDeletedRecords]);

    // 프로젝트 코드 자동완성 옵션
    const project_code_options = useMemo(() => {
        return getProjectCodeOptions();
    }, [records, templates, getProjectCodeOptions]);

    // 확장 행 렌더링 (record_id만 전달하여 타이머 리렌더링 영향 완전 차단)
    const expandedRowRender = useCallback(
        (record: WorkRecord) => <SessionEditTable record_id={record.id} />,
        []
    );

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
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            width: 200,
            render: (text: string, record: WorkRecord) => {
                const is_active = getActiveRecordId() === record.id;
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
                                    {formatTimer(getElapsedSeconds())}
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
            width: 120,
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
            render: (_: number, record: WorkRecord) => {
                // 선택된 날짜의 시간만 표시
                const date_minutes = getRecordDurationMinutesForDate(
                    record,
                    selected_date
                );
                return (
                    <Text strong style={{ color: "#1890ff" }}>
                        {date_minutes}분
                    </Text>
                );
            },
        },
        {
            title: "시작-종료",
            key: "time_range",
            width: 120,
            render: (_, record: WorkRecord) => {
                // 선택된 날짜의 시간 범위만 표시
                const time_range = getTimeRangeForDate(record, selected_date);
                return (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {time_range.start_time?.slice(0, 5) || "-"} ~{" "}
                        {time_range.end_time?.slice(0, 5) || "-"}
                    </Text>
                );
            },
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
                            description="이 기록을 휴지통으로 이동하시겠습니까?"
                            onConfirm={() => softDeleteRecord(record.id)}
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
                                {timer.active_form_data.deal_name ||
                                    timer.active_form_data.work_name}{" "}
                                진행 중
                            </Tag>
                        )}
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
                        {deleted_records.length > 0 && (
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => setIsDeletedModalOpen(true)}
                                danger
                            >
                                휴지통 ({deleted_records.length})
                            </Button>
                        )}
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
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <div
                                className={`expand-icon ${
                                    expanded ? "expanded" : ""
                                }`}
                                onClick={(e) => onExpand(record, e)}
                            >
                                <DownOutlined />
                            </div>
                        ),
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
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

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
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(
                                                    () =>
                                                        new_task_input_ref.current?.focus(),
                                                    0
                                                );
                                            }}
                                        >
                                            <Input
                                                ref={new_task_input_ref}
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
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(
                                                        () =>
                                                            new_task_input_ref.current?.focus(),
                                                        0
                                                    );
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    new_task_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddTaskOption}
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
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
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(
                                                    () =>
                                                        new_category_input_ref.current?.focus(),
                                                    0
                                                );
                                            }}
                                        >
                                            <Input
                                                ref={new_category_input_ref}
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
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(
                                                        () =>
                                                            new_category_input_ref.current?.focus(),
                                                        0
                                                    );
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    new_category_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
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
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
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
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

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
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(
                                                    () =>
                                                        edit_task_input_ref.current?.focus(),
                                                    0
                                                );
                                            }}
                                        >
                                            <Input
                                                ref={edit_task_input_ref}
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
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(
                                                        () =>
                                                            edit_task_input_ref.current?.focus(),
                                                        0
                                                    );
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    edit_task_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
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
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
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
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(
                                                    () =>
                                                        edit_category_input_ref.current?.focus(),
                                                    0
                                                );
                                            }}
                                        >
                                            <Input
                                                ref={edit_category_input_ref}
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
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(
                                                        () =>
                                                            edit_category_input_ref.current?.focus(),
                                                        0
                                                    );
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    edit_category_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
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
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
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
                            title: "거래명",
                            dataIndex: "deal_name",
                            key: "deal_name",
                            width: 200,
                            render: (text: string, record: WorkRecord) => (
                                <Text strong>{text || record.work_name}</Text>
                            ),
                        },
                        {
                            title: "작업명",
                            dataIndex: "work_name",
                            key: "work_name",
                            width: 120,
                            render: (text: string) => (
                                <Tag color="blue" style={{ fontSize: 11 }}>
                                    {text}
                                </Tag>
                            ),
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
                                        description="이 기록을 휴지통으로 이동하시겠습니까?"
                                        onConfirm={() =>
                                            softDeleteRecord(record.id)
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

            {/* 삭제된 작업 (휴지통) 모달 */}
            <Modal
                title={
                    <Space>
                        <DeleteOutlined style={{ color: "#ff4d4f" }} />
                        <span>휴지통</span>
                        <Tag color="error">{deleted_records.length}건</Tag>
                    </Space>
                }
                open={is_deleted_modal_open}
                onCancel={() => setIsDeletedModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsDeletedModalOpen(false)}
                    >
                        닫기
                    </Button>,
                ]}
                width={800}
            >
                <Table
                    dataSource={deleted_records}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    columns={[
                        {
                            title: "거래명",
                            dataIndex: "deal_name",
                            key: "deal_name",
                            ellipsis: true,
                            render: (text: string) => (
                                <Typography.Text strong>{text}</Typography.Text>
                            ),
                        },
                        {
                            title: "작업명",
                            dataIndex: "work_name",
                            key: "work_name",
                            width: 120,
                            render: (text: string) => (
                                <Tag color="blue">{text}</Tag>
                            ),
                        },
                        {
                            title: "시간",
                            dataIndex: "duration_minutes",
                            key: "duration_minutes",
                            width: 80,
                            render: (mins: number) => formatDuration(mins),
                        },
                        {
                            title: "삭제일",
                            dataIndex: "deleted_at",
                            key: "deleted_at",
                            width: 100,
                            render: (date: string) =>
                                date ? dayjs(date).format("MM/DD HH:mm") : "-",
                        },
                        {
                            title: "작업",
                            key: "actions",
                            width: 120,
                            render: (_: unknown, record: WorkRecord) => (
                                <Space size="small">
                                    <Tooltip title="복원">
                                        <Button
                                            type="text"
                                            icon={<UndoOutlined />}
                                            size="small"
                                            onClick={() => {
                                                restoreRecord(record.id);
                                                message.success("작업이 복원되었습니다");
                                            }}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="완전 삭제"
                                        description="이 기록을 완전히 삭제하시겠습니까? 복구할 수 없습니다."
                                        onConfirm={() => {
                                            permanentlyDeleteRecord(record.id);
                                            message.success("작업이 완전히 삭제되었습니다");
                                        }}
                                        okText="삭제"
                                        cancelText="취소"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Tooltip title="완전 삭제">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                size="small"
                                            />
                                        </Tooltip>
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                    locale={{
                        emptyText: "휴지통이 비어있습니다.",
                    }}
                />
            </Modal>

            <style>{`
                .active-row {
                    background-color: #e6f7ff !important;
                }
                .active-row:hover > td {
                    background-color: #bae7ff !important;
                }
                
                /* 확장 아이콘 애니메이션 */
                .expand-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #999;
                    background: transparent;
                }
                
                .expand-icon:hover {
                    background: #f0f5ff;
                    color: #1890ff;
                    transform: scale(1.1);
                }
                
                .expand-icon .anticon {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .expand-icon.expanded {
                    color: #1890ff;
                    background: #e6f7ff;
                }
                
                .expand-icon.expanded .anticon {
                    transform: rotate(-180deg);
                }
                
                /* 확장된 row 애니메이션 */
                .ant-table-expanded-row > td {
                    animation: slideDown 0.3s ease-out;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
