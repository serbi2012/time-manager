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
    Empty,
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
    CloseOutlined,
    MoreOutlined,
    SearchOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    APP_THEME_COLORS,
} from "../store/useWorkStore";
import { useShortcutStore } from "../store/useShortcutStore";
import type { WorkRecord, WorkSession } from "../types";
import { useResponsive } from "../hooks/useResponsive";
import { formatShortcutKeyForPlatform, matchShortcutKey } from "../hooks/useShortcuts";
import { HighlightText } from "../shared/ui/HighlightText";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const { Text } = Typography;

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
    const updateRecord = useWorkStore((state) => state.updateRecord);
    const selected_date = useWorkStore((state) => state.selected_date);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    // 선택 삭제를 위한 상태
    const [selected_session_keys, setSelectedSessionKeys] = useState<React.Key[]>([]);

    // 세션 추가를 위한 상태
    const [is_adding_session, setIsAddingSession] = useState(false);
    const [new_session_date, setNewSessionDate] = useState(selected_date);
    const [new_session_start, setNewSessionStart] = useState("");
    const [new_session_end, setNewSessionEnd] = useState("");

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

    // 선택 삭제 함수
    const handleBulkDeleteSessions = useCallback(() => {
        if (selected_session_keys.length === 0) return;

        selected_session_keys.forEach((key) => {
            deleteSession(record_id, key as string);
        });

        message.success(`${selected_session_keys.length}개 세션이 삭제되었습니다`);
        setSelectedSessionKeys([]);
    }, [selected_session_keys, record_id, deleteSession]);

    // 세션 추가 핸들러
    const handleAddSession = useCallback(() => {
        if (!record) return;
        if (!new_session_start || !new_session_end) {
            message.error("시작 시간과 종료 시간을 모두 입력하세요.");
            return;
        }

        // 시간 유효성 검사
        const start_minutes = dayjs(`2000-01-01 ${new_session_start}`).hour() * 60 +
            dayjs(`2000-01-01 ${new_session_start}`).minute();
        const end_minutes = dayjs(`2000-01-01 ${new_session_end}`).hour() * 60 +
            dayjs(`2000-01-01 ${new_session_end}`).minute();

        if (start_minutes >= end_minutes) {
            message.error("종료 시간은 시작 시간보다 늦어야 합니다.");
            return;
        }

        const duration = end_minutes - start_minutes;

        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: new_session_date,
            start_time: new_session_start,
            end_time: new_session_end,
            duration_minutes: duration,
        };

        // 기존 세션과 병합하여 시간순 정렬
        const updated_sessions = [...(record.sessions || []), new_session].sort((a, b) => {
            const a_date = a.date || record.date;
            const b_date = b.date || record.date;
            if (a_date !== b_date) return a_date.localeCompare(b_date);
            return (a.start_time || "").localeCompare(b.start_time || "");
        });

        // 총 시간 계산
        const total_minutes = updated_sessions.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0
        );

        // 전체 시간 범위 계산
        const first_session = updated_sessions[0];
        const last_session = updated_sessions[updated_sessions.length - 1];

        updateRecord(record_id, {
            sessions: updated_sessions,
            duration_minutes: total_minutes,
            start_time: first_session?.start_time || record.start_time,
            end_time: last_session?.end_time || record.end_time,
        });

        message.success("세션이 추가되었습니다.");

        // 상태 초기화
        setIsAddingSession(false);
        setNewSessionStart("");
        setNewSessionEnd("");
    }, [record, record_id, new_session_date, new_session_start, new_session_end, updateRecord]);

    // 세션 추가 취소
    const handleCancelAddSession = useCallback(() => {
        setIsAddingSession(false);
        setNewSessionStart("");
        setNewSessionEnd("");
    }, []);

    // 세션 추가 시작
    const handleStartAddSession = useCallback(() => {
        setNewSessionDate(selected_date);
        setIsAddingSession(true);
    }, [selected_date]);

    if (!record) {
        return (
            <div style={{ padding: "16px", color: "#999" }}>
                레코드를 찾을 수 없습니다.
            </div>
        );
    }

    // sessions가 비어있고, start_time도 없으면 빈 배열 (새 작업 추가 시)
    const sessions: WorkSession[] =
        record.sessions && record.sessions.length > 0
            ? record.sessions
            : record.start_time
              ? [
                    {
                        id: record.id,
                        date: record.date,
                        start_time: record.start_time,
                        end_time: record.end_time,
                        duration_minutes: record.duration_minutes,
                    },
                ]
              : [];

    if (sessions.length === 0) {
        return (
            <div style={{ padding: "16px" }}>
                {is_adding_session ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <DatePicker
                            value={dayjs(new_session_date)}
                            onChange={(date) => setNewSessionDate(date?.format("YYYY-MM-DD") || selected_date)}
                            size="small"
                            style={{ width: 120 }}
                            allowClear={false}
                        />
                        <Input
                            placeholder="시작 (HH:mm)"
                            value={new_session_start}
                            onChange={(e) => setNewSessionStart(e.target.value)}
                            size="small"
                            style={{ width: 100, fontFamily: "monospace" }}
                        />
                        <span>~</span>
                        <Input
                            placeholder="종료 (HH:mm)"
                            value={new_session_end}
                            onChange={(e) => setNewSessionEnd(e.target.value)}
                            size="small"
                            style={{ width: 100, fontFamily: "monospace" }}
                        />
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={handleAddSession}
                        >
                            추가
                        </Button>
                        <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelAddSession}
                        >
                            취소
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Text type="secondary">세션 이력이 없습니다.</Text>
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={handleStartAddSession}
                        >
                            세션 추가
                        </Button>
                    </div>
                )}
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
                {selected_session_keys.length > 0 && (
                    <Popconfirm
                        title="선택 삭제"
                        description={`${selected_session_keys.length}개 세션을 삭제하시겠습니까?`}
                        onConfirm={handleBulkDeleteSessions}
                        okText="삭제"
                        cancelText="취소"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            style={{ marginLeft: 16 }}
                        >
                            선택 삭제 ({selected_session_keys.length})
                        </Button>
                    </Popconfirm>
                )}
            </div>

            <Table
                dataSource={sessions}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ marginTop: 16 }}
                rowSelection={{
                    selectedRowKeys: selected_session_keys,
                    onChange: (keys) => setSelectedSessionKeys(keys),
                }}
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
                            session.end_time === "" ? (
                                <Text type="secondary" style={{ fontFamily: "monospace", fontSize: 12 }}>
                                    진행중
                                </Text>
                            ) : (
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
                            )
                        ),
                    },
                    {
                        title: "소요 시간",
                        key: "duration",
                        width: 100,
                        render: (_: unknown, session: WorkSession) => (
                            <Tag color={theme_color}>
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
                            session.end_time === "" ? (
                                <Tooltip title="진행 중인 세션은 삭제할 수 없습니다">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        disabled
                                    />
                                </Tooltip>
                            ) : (
                                <Popconfirm
                                    title="세션 삭제"
                                    description="이 세션을 삭제하시겠습니까?"
                                    onConfirm={() =>
                                        handleDeleteSession(session.id)
                                    }
                                    okText="삭제"
                                    cancelText="취소"
                                    okButtonProps={{ danger: true, autoFocus: true }}
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                    />
                                </Popconfirm>
                            )
                        ),
                    },
                ]}
            />

            {/* 세션 추가 UI */}
            <div style={{ marginTop: 12 }}>
                {is_adding_session ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <DatePicker
                            value={dayjs(new_session_date)}
                            onChange={(date) => setNewSessionDate(date?.format("YYYY-MM-DD") || selected_date)}
                            size="small"
                            style={{ width: 120 }}
                            allowClear={false}
                        />
                        <Input
                            placeholder="시작 (HH:mm)"
                            value={new_session_start}
                            onChange={(e) => setNewSessionStart(e.target.value)}
                            size="small"
                            style={{ width: 100, fontFamily: "monospace" }}
                        />
                        <span>~</span>
                        <Input
                            placeholder="종료 (HH:mm)"
                            value={new_session_end}
                            onChange={(e) => setNewSessionEnd(e.target.value)}
                            size="small"
                            style={{ width: 100, fontFamily: "monospace" }}
                        />
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={handleAddSession}
                        >
                            추가
                        </Button>
                        <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelAddSession}
                        >
                            취소
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleStartAddSession}
                    >
                        세션 추가
                    </Button>
                )}
            </div>

            <div className="session-summary">
                <Space split={<span style={{ color: "#d9d9d9" }}>|</span>}>
                    <Text type="secondary">첫 시작: {record.start_time}</Text>
                    <Text type="secondary">마지막 종료: {record.end_time}</Text>
                    <Text strong style={{ color: theme_color }}>
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
    const { is_mobile } = useResponsive();

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
        startTimerForRecord,
        stopTimer,
        updateActiveFormData,
        getElapsedSeconds,
        templates,
        getAutoCompleteOptions,
        getCompletedRecords,
        markAsCompleted,
        markAsIncomplete,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        addCustomTaskOption,
        addCustomCategoryOption,
        getProjectCodeOptions,
        addRecord,
        hideAutoCompleteOption,
        app_theme,
    } = useWorkStore();

    // 테마 색상
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    // 단축키 설정
    const shortcuts = useShortcutStore((state) => state.shortcuts);
    const getShortcutKeys = useCallback((id: string, fallback: string = '') => {
        const shortcut = shortcuts.find(s => s.id === id);
        return shortcut?.keys || fallback;
    }, [shortcuts]);
    
    const modal_submit_keys = getShortcutKeys('modal-submit', 'F8');
    const new_work_keys = getShortcutKeys('new-work', 'Alt+N');
    const prev_day_keys = getShortcutKeys('prev-day', 'Alt+Left');
    const next_day_keys = getShortcutKeys('next-day', 'Alt+Right');

    // 타이머 표시를 위한 리렌더링 트리거
    const [, setTick] = useState(0);

    // 모바일 카드 확장 상태
    const [expanded_card_id, setExpandedCardId] = useState<string | null>(null);

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [is_completed_modal_open, setIsCompletedModalOpen] = useState(false);
    const [is_deleted_modal_open, setIsDeletedModalOpen] = useState(false);
    const [completed_search_text, setCompletedSearchText] = useState("");
    const [deleted_search_text, setDeletedSearchText] = useState("");
    const [editing_record, setEditingRecord] = useState<WorkRecord | null>(
        null
    );
    const [form] = Form.useForm();
    const [edit_form] = Form.useForm();
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");
    const [edit_task_input, setEditTaskInput] = useState("");
    const [edit_category_input, setEditCategoryInput] = useState("");

    // AutoComplete 검색어 상태 (하이라이트용) - 디바운스 적용
    const [project_code_search, setProjectCodeSearch] = useState("");
    const [work_name_search, setWorkNameSearch] = useState("");
    const [deal_name_search, setDealNameSearch] = useState("");
    const debounced_project_code_search = useDebouncedValue(project_code_search, 150);
    const debounced_work_name_search = useDebouncedValue(work_name_search, 150);
    const debounced_deal_name_search = useDebouncedValue(deal_name_search, 150);

    // Input refs for focus management
    const new_task_input_ref = useRef<InputRef>(null);
    const new_category_input_ref = useRef<InputRef>(null);
    const edit_task_input_ref = useRef<InputRef>(null);
    const edit_category_input_ref = useRef<InputRef>(null);

    // 작업명/거래명 자동완성 옵션 (records, templates 변경 시 갱신, 삭제 버튼 포함, 검색어 하이라이트)
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({
            value: v,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span><HighlightText text={v} search={debounced_work_name_search} /></span>
                    <CloseOutlined
                        style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("work_name", v);
                            message.info(`"${v}" 옵션이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [records, templates, hidden_autocomplete_options, debounced_work_name_search, getAutoCompleteOptions, hideAutoCompleteOption]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({
            value: v,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span><HighlightText text={v} search={debounced_deal_name_search} /></span>
                    <CloseOutlined
                        style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("deal_name", v);
                            message.info(`"${v}" 옵션이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [records, templates, hidden_autocomplete_options, debounced_deal_name_search, getAutoCompleteOptions, hideAutoCompleteOption]);

    // 업무명/카테고리명 옵션 (기본 + 사용자 정의, 숨김 필터링)
    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        const hidden = hidden_autocomplete_options.task_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_task_options, hidden_autocomplete_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        const hidden = hidden_autocomplete_options.category_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_category_options, hidden_autocomplete_options]);

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

    // 단축키 이벤트 리스너: 새 작업 모달 열기
    useEffect(() => {
        const handleOpenNewWorkModal = () => {
            setIsModalOpen(true);
        };
        window.addEventListener("shortcut:openNewWorkModal", handleOpenNewWorkModal);
        return () => {
            window.removeEventListener("shortcut:openNewWorkModal", handleOpenNewWorkModal);
        };
    }, []);

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

        // 선택된 날짜에 세션이 있는 레코드도 포함 (간트 차트와 동기화)
        const records_with_sessions_today = records.filter((r) => {
            if (r.is_deleted) return false;
            if (!r.sessions || r.sessions.length === 0) return false;
            // 레코드가 이미 포함되어 있으면 스킵
            if (!r.is_completed && r.date <= selected_date) return false;
            if (r.date === selected_date && r.is_completed) return false;
            // 해당 날짜에 세션이 있는지 확인
            return r.sessions.some(
                (s) => (s.date || r.date) === selected_date
            );
        });

        const all_records = [
            ...incomplete_records,
            ...completed_today,
            ...records_with_sessions_today,
        ];

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

    // 클립보드 복사 (표 형식) - 선택된 날짜의 시간만 계산
    const handleCopyToClipboard = () => {
        const header = "작업명\t업무명\t거래명\t카테고리명\t시간(분)\t비고";
        const rows = filtered_records.map(
            (r) =>
                `${r.work_name}\t${r.task_name}\t${r.deal_name}\t${
                    r.category_name
                }\t${getRecordDurationMinutesForDate(r, selected_date)}\t${r.note}`
        );
        const text = [header, ...rows].join("\n");
        navigator.clipboard.writeText(text);
    };

    // 작업 시작/중지 토글
    const handleToggleRecord = (record: WorkRecord) => {
        const is_active = getActiveRecordId() === record.id;

        // 완료된 작업이면 시작 시 자동으로 완료 취소
        if (record.is_completed && !is_active) {
            markAsIncomplete(record.id);
        }

        if (is_active) {
            // 현재 작업 중지
            stopTimer();
        } else {
            // 기존 레코드에 직접 세션 추가하며 타이머 시작
            // (타이머가 실행 중이면 내부적으로 먼저 정지 후 시작)
            startTimerForRecord(record.id);
        }
    };

    // 새 작업 추가 (타이머 시작 없이 레코드만 생성)
    const handleAddNewWork = async () => {
        try {
            const values = await form.validateFields();

            // 새 레코드 생성 (타이머 없이 즉시 추가)
            // start_time/end_time 비워서 간트에 표시되지 않도록
            // 선택된 날짜에 작업 추가 (달력에서 다른 날짜를 보고 있으면 해당 날짜에 추가)
            const new_record: WorkRecord = {
                id: crypto.randomUUID(),
                project_code: values.project_code || "A00_00000",
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
                duration_minutes: 0,
                start_time: "",
                end_time: "",
                date: selected_date,
                sessions: [],
                is_completed: false,
                is_deleted: false,
            };

            addRecord(new_record);
            message.success("작업이 추가되었습니다");

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
            
            const updated_data = {
                project_code: values.project_code || "",
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            };
            
            // 레코딩 중인 가상 레코드인 경우
            if (editing_record.id === "__active__") {
                // timer.active_form_data + form_data 모두 업데이트
                updateActiveFormData(updated_data);
            } else {
                // 실제 레코드 업데이트
                updateRecord(editing_record.id, updated_data);
                
                // 타이머가 실행 중이고, 현재 수정한 레코드가 타이머 추적 중인 레코드인 경우
                // timer.active_form_data도 함께 업데이트
                const active_form = timer.active_form_data;
                if (
                    timer.is_running &&
                    active_form &&
                    editing_record.work_name === active_form.work_name &&
                    editing_record.deal_name === active_form.deal_name
                ) {
                    updateActiveFormData(updated_data);
                }
            }
            
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

    // 검색어로 필터링된 완료된 작업 목록
    const filtered_completed_records = useMemo(() => {
        if (!completed_search_text.trim()) {
            return completed_records;
        }
        const search_lower = completed_search_text.toLowerCase().trim();
        return completed_records.filter((record) => {
            const deal_name = (record.deal_name || "").toLowerCase();
            const work_name = (record.work_name || "").toLowerCase();
            const project_code = (record.project_code || "").toLowerCase();
            return (
                deal_name.includes(search_lower) ||
                work_name.includes(search_lower) ||
                project_code.includes(search_lower)
            );
        });
    }, [completed_records, completed_search_text]);

    // 검색어로 필터링된 삭제된 작업 목록 (삭제일 기준 내림차순 정렬)
    const filtered_deleted_records = useMemo(() => {
        let result = deleted_records;
        
        if (deleted_search_text.trim()) {
            const search_lower = deleted_search_text.toLowerCase().trim();
            result = result.filter((record) => {
                const deal_name = (record.deal_name || "").toLowerCase();
                const work_name = (record.work_name || "").toLowerCase();
                const project_code = (record.project_code || "").toLowerCase();
                return (
                    deal_name.includes(search_lower) ||
                    work_name.includes(search_lower) ||
                    project_code.includes(search_lower)
                );
            });
        }
        
        // 삭제일 기준 내림차순 정렬 (최신 삭제가 위로)
        return [...result].sort((a, b) => {
            const date_a = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
            const date_b = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
            return date_b - date_a;
        });
    }, [deleted_records, deleted_search_text]);

    // 프로젝트 코드 자동완성 옵션 (삭제 버튼 포함)
    // 프로젝트 코드 원본 레이블 저장 (하이라이트용)
    const project_code_raw_options = useMemo(() => {
        return getProjectCodeOptions();
    }, [records, templates, hidden_autocomplete_options, getProjectCodeOptions]);

    const project_code_options = useMemo(() => {
        return project_code_raw_options.map((opt) => ({
            ...opt,
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span><HighlightText text={opt.label} search={debounced_project_code_search} /></span>
                    <CloseOutlined
                        style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("project_code", opt.value);
                            message.info(`"${opt.label}" 항목이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [project_code_raw_options, debounced_project_code_search, hideAutoCompleteOption]);

    // 프로젝트 코드 선택 시 코드와 작업명 자동 채우기 핸들러
    const handleProjectCodeSelect = useCallback(
        (value: string, form_instance: ReturnType<typeof Form.useForm>[0]) => {
            // value는 "코드::작업명" 형태
            const [code, work_name] = value.split("::");
            form_instance.setFieldsValue({
                project_code: code, // 실제 코드만 저장
                ...(work_name ? { work_name } : {}),
            });
        },
        []
    );

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
                                        ? theme_color
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
                                    color={theme_color}
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
                <Tag color={theme_color} style={{ fontSize: 11 }}>
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
                return text ? (
                    <Tag color={getCategoryColor(text)}>{text}</Tag>
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
                    <Text strong style={{ color: theme_color }}>
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
                const is_active = record.id === "__active__";
                
                return (
                    <Space size={4}>
                        {/* 완료/완료 취소 버튼 (가상 레코드는 불가) */}
                        {!is_active && (
                            record.is_completed ? (
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
                            )
                        )}
                        {/* 수정 버튼 (가상 레코드도 가능) */}
                        <Tooltip title="수정">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleOpenEditModal(record)}
                            />
                        </Tooltip>
                        {/* 삭제 버튼 (가상 레코드는 불가) */}
                        {!is_active && (
                            <Popconfirm
                                title="삭제 확인"
                                description="이 기록을 휴지통으로 이동하시겠습니까?"
                                onConfirm={() => softDeleteRecord(record.id)}
                                okText="삭제"
                                cancelText="취소"
                                okButtonProps={{ danger: true, autoFocus: true }}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                />
                            </Popconfirm>
                        )}
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
                                color={theme_color}
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
                    <Space size={is_mobile ? 4 : 12} wrap>
                        {/* 날짜 네비게이션 그룹 */}
                        <Space.Compact>
                            <Tooltip title={`이전 날짜 (${formatShortcutKeyForPlatform(prev_day_keys)})`}>
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={() =>
                                        setSelectedDate(
                                            dayjs(selected_date)
                                                .subtract(1, "day")
                                                .format("YYYY-MM-DD")
                                        )
                                    }
                                />
                            </Tooltip>
                            <DatePicker
                                value={dayjs(selected_date)}
                                onChange={(date) =>
                                    setSelectedDate(
                                        date?.format("YYYY-MM-DD") ||
                                            dayjs().format("YYYY-MM-DD")
                                    )
                                }
                                format="YYYY-MM-DD (dd)"
                                allowClear={false}
                                style={is_mobile ? { width: 130 } : { width: 150 }}
                            />
                            <Tooltip title={`다음 날짜 (${formatShortcutKeyForPlatform(next_day_keys)})`}>
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={() =>
                                        setSelectedDate(
                                            dayjs(selected_date)
                                                .add(1, "day")
                                                .format("YYYY-MM-DD")
                                        )
                                    }
                                />
                            </Tooltip>
                        </Space.Compact>

                        {/* 주요 액션 버튼 */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            {is_mobile ? null : (
                                <>
                                    새 작업{" "}
                                    <span style={{
                                        fontSize: 11,
                                        opacity: 0.85,
                                        marginLeft: 4,
                                        padding: "1px 4px",
                                        background: "rgba(255,255,255,0.2)",
                                        borderRadius: 3,
                                    }}>
                                        {formatShortcutKeyForPlatform(new_work_keys)}
                                    </span>
                                </>
                            )}
                        </Button>

                        {/* 보조 액션 버튼들 */}
                        <Tooltip title="완료된 작업 목록">
                            <Button
                                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                onClick={() => setIsCompletedModalOpen(true)}
                            >
                                {is_mobile ? null : "완료"}
                            </Button>
                        </Tooltip>
                        <Tooltip title="삭제된 작업 (복구 가능)">
                            <Button
                                icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
                                onClick={() => setIsDeletedModalOpen(true)}
                            >
                                {is_mobile ? null : "휴지통"}
                            </Button>
                        </Tooltip>
                        <Tooltip title="시간 관리 양식으로 복사">
                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopyToClipboard}
                                disabled={filtered_records.length === 0}
                            >
                                {is_mobile ? null : "내역 복사"}
                            </Button>
                        </Tooltip>
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

                {/* 데스크톱 테이블 뷰 */}
                {!is_mobile && (
                    <div className="desktop-record-table">
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
                    </div>
                )}

                {/* 모바일 카드 뷰 */}
                {is_mobile && (
                    <div className="mobile-record-list">
                        {filtered_records.length === 0 ? (
                            <Empty
                                description="작업 기록이 없습니다"
                                style={{ padding: "40px 0" }}
                            />
                        ) : (
                            filtered_records.map((record) => {
                                const is_active = getActiveRecordId() === record.id;
                                const is_running = timer.is_running && is_active;
                                const elapsed = is_running ? getElapsedSeconds() : 0;
                                const duration_for_date = getRecordDurationMinutesForDate(record, selected_date);
                                const time_range = getTimeRangeForDate(record, selected_date);
                                const is_expanded = expanded_card_id === record.id;

                                return (
                                    <div
                                        key={record.id}
                                        className={`mobile-record-card ${is_running ? "running" : ""}`}
                                    >
                                        {/* 헤더: 거래명 + 타이머 */}
                                        <div className="mobile-record-card-header">
                                            <div className="mobile-record-card-title">
                                                {record.deal_name || record.work_name}
                                            </div>
                                            {is_running && (
                                                <div className="mobile-record-card-timer">
                                                    {formatTimer(elapsed)}
                                                </div>
                                            )}
                                        </div>

                                        {/* 태그 영역 */}
                                        <div className="mobile-record-card-tags">
                                            <Tag color={theme_color} style={{ margin: 0 }}>
                                                {record.work_name}
                                            </Tag>
                                            {record.task_name && (
                                                <Tag color="cyan" style={{ margin: 0 }}>
                                                    {record.task_name}
                                                </Tag>
                                            )}
                                            {record.category_name && (
                                                <Tag
                                                    color={getCategoryColor(record.category_name)}
                                                    style={{ margin: 0 }}
                                                >
                                                    {record.category_name}
                                                </Tag>
                                            )}
                                        </div>

                                        {/* 정보 영역 */}
                                        <div className="mobile-record-card-info">
                                            <div className="mobile-record-card-time">
                                                <ClockCircleOutlined />
                                                <span>
                                                    {is_running
                                                        ? formatDuration(duration_for_date + Math.floor(elapsed / 60))
                                                        : formatDuration(duration_for_date)}
                                                </span>
                                            </div>
                                            {time_range.start_time && (
                                                <span>
                                                    {time_range.start_time} ~ {time_range.end_time || "진행중"}
                                                </span>
                                            )}
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div className="mobile-record-card-actions">
                                            {is_running ? (
                                                <Button
                                                    type="primary"
                                                    danger
                                                    icon={<PauseCircleOutlined />}
                                                    onClick={() => stopTimer()}
                                                >
                                                    정지
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    icon={<PlayCircleOutlined />}
                                                    onClick={() => {
                                                        // 완료된 작업이면 시작 시 자동으로 완료 취소
                                                        if (record.is_completed) {
                                                            markAsIncomplete(record.id);
                                                        }
                                                        // 기존 레코드에 직접 세션 추가하며 타이머 시작
                                                        startTimerForRecord(record.id);
                                                    }}
                                                >
                                                    시작
                                                </Button>
                                            )}
                                            <Button
                                                icon={<EditOutlined />}
                                                onClick={() => {
                                                    setEditingRecord(record);
                                                    edit_form.setFieldsValue({
                                                        project_code: record.project_code,
                                                        work_name: record.work_name,
                                                        task_name: record.task_name,
                                                        deal_name: record.deal_name,
                                                        category_name: record.category_name,
                                                        note: record.note,
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                수정
                                            </Button>
                                            <Button
                                                icon={<MoreOutlined />}
                                                onClick={() => {
                                                    setExpandedCardId(is_expanded ? null : record.id);
                                                }}
                                            />
                                        </div>

                                        {/* 확장 영역: 세션 이력 */}
                                        {is_expanded && (
                                            <div style={{ marginTop: 12 }}>
                                                <SessionEditTable record_id={record.id} />
                                                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                                                    <Popconfirm
                                                        title="작업 삭제"
                                                        description="휴지통으로 이동합니다"
                                                        onConfirm={() => softDeleteRecord(record.id)}
                                                        okText="삭제"
                                                        cancelText="취소"
                                                        okButtonProps={{ danger: true, autoFocus: true }}
                                                    >
                                                        <Button danger icon={<DeleteOutlined />} size="small">
                                                            삭제
                                                        </Button>
                                                    </Popconfirm>
                                                    {!record.is_completed && (
                                                        <Button
                                                            icon={<CheckCircleOutlined />}
                                                            size="small"
                                                            onClick={() => markAsCompleted(record.id)}
                                                        >
                                                            완료
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </Card>

            <Modal
                title="새 작업 시작"
                open={is_modal_open}
                onCancel={() => {
                    form.resetFields();
                    setIsModalOpen(false);
                }}
                footer={[
                    <Button key="ok" type="primary" onClick={handleAddNewWork}>
                        추가{" "}
                        <span style={{
                            fontSize: 11,
                            opacity: 0.85,
                            marginLeft: 4,
                            padding: "1px 4px",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: 3,
                        }}>
                            F8
                        </span>
                    </Button>,
                    <Button
                        key="cancel"
                        onClick={() => {
                            form.resetFields();
                            setIsModalOpen(false);
                        }}
                    >
                        취소
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (e.key === "F8") {
                            e.preventDefault();
                            handleAddNewWork();
                        }
                    }}
                >
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onSearch={setProjectCodeSearch}
                            onSelect={(value: string) =>
                                handleProjectCodeSelect(value, form)
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
                            onSearch={setWorkNameSearch}
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
                            onSearch={setDealNameSearch}
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
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption("task_option", option.value as string);
                                            }}
                                        />
                                    </div>
                                )}
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
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption("category_option", option.value as string);
                                            }}
                                        />
                                    </div>
                                )}
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
                onCancel={() => {
                    edit_form.resetFields();
                    setEditingRecord(null);
                    setIsEditModalOpen(false);
                }}
                footer={[
                    <Button key="ok" type="primary" onClick={handleSaveEdit}>
                        저장 ({formatShortcutKeyForPlatform(modal_submit_keys)})
                    </Button>,
                    <Button
                        key="cancel"
                        onClick={() => {
                            edit_form.resetFields();
                            setEditingRecord(null);
                            setIsEditModalOpen(false);
                        }}
                    >
                        취소
                    </Button>,
                ]}
            >
                <Form
                    form={edit_form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (matchShortcutKey(e, modal_submit_keys)) {
                            e.preventDefault();
                            handleSaveEdit();
                        }
                    }}
                >
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onSearch={setProjectCodeSearch}
                            onSelect={(value: string) =>
                                handleProjectCodeSelect(value, edit_form)
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
                            onSearch={setWorkNameSearch}
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
                            onSearch={setDealNameSearch}
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
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption("task_option", option.value as string);
                                            }}
                                        />
                                    </div>
                                )}
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
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{ fontSize: 10, color: "#999", cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption("category_option", option.value as string);
                                            }}
                                        />
                                    </div>
                                )}
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
                onCancel={() => {
                    setIsCompletedModalOpen(false);
                    setCompletedSearchText("");
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setIsCompletedModalOpen(false);
                            setCompletedSearchText("");
                        }}
                    >
                        닫기
                    </Button>,
                ]}
                width={800}
            >
                <Input
                    placeholder="거래명, 작업명, 프로젝트 코드로 검색"
                    prefix={<SearchOutlined style={{ color: "#999" }} />}
                    value={completed_search_text}
                    onChange={(e) => setCompletedSearchText(e.target.value)}
                    allowClear
                    style={{ marginBottom: 16 }}
                />
                <Table
                    dataSource={filtered_completed_records}
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
                                <Tag color={theme_color} style={{ fontSize: 11 }}>
                                    {text}
                                </Tag>
                            ),
                        },
                        {
                            title: "시간",
                            key: "duration",
                            width: 60,
                            render: (_: unknown, record: WorkRecord) => (
                                <Text style={{ color: theme_color }}>
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
                                        okButtonProps={{ danger: true, autoFocus: true }}
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
                onCancel={() => {
                    setIsDeletedModalOpen(false);
                    setDeletedSearchText("");
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setIsDeletedModalOpen(false);
                            setDeletedSearchText("");
                        }}
                    >
                        닫기
                    </Button>,
                ]}
                width={800}
            >
                <Input
                    placeholder="거래명, 작업명, 프로젝트 코드로 검색"
                    prefix={<SearchOutlined style={{ color: "#999" }} />}
                    value={deleted_search_text}
                    onChange={(e) => setDeletedSearchText(e.target.value)}
                    allowClear
                    style={{ marginBottom: 16 }}
                />
                <Table
                    dataSource={filtered_deleted_records}
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
                                <Tag color={theme_color}>{text}</Tag>
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
                                        okButtonProps={{ danger: true, autoFocus: true }}
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
                    background-color: ${theme_color}15 !important;
                }
                .active-row:hover > td {
                    background-color: ${theme_color}25 !important;
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
                    background: ${theme_color}15;
                    color: ${theme_color};
                    transform: scale(1.1);
                }
                
                .expand-icon .anticon {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .expand-icon.expanded {
                    color: ${theme_color};
                    background: ${theme_color}15;
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
