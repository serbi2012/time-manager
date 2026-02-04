/**
 * 작업 레코드 테이블 컴포넌트 (리팩토링 완료)
 *
 * Phase 8 리팩토링:
 * - 순수 함수 → features/work-record/lib/
 * - 커스텀 훅 → features/work-record/hooks/
 * - 컬럼 렌더러 → features/work-record/ui/RecordColumns/
 * - UI 컴포넌트 → features/work-record/ui/RecordTable/
 * - 상수 → features/work-record/constants/
 */

import { useMemo, useCallback } from "react";
import {
    Table,
    Card,
    DatePicker,
    Button,
    Space,
    Tag,
    Tooltip,
    message,
} from "antd";
import {
    ClockCircleOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

// Store
import { useWorkStore, APP_THEME_COLORS } from "../store/useWorkStore";
import { useShortcutStore } from "../store/useShortcutStore";

// Types
import type { WorkRecord } from "../types";

// Hooks
import { useResponsive } from "../hooks/useResponsive";
import { formatShortcutKeyForPlatform } from "../hooks/useShortcuts";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

// Features - Hooks
import {
    useRecordData,
    useRecordStats,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
} from "../features/work-record/hooks";

// Features - UI Components
import { DailyStats } from "../features/work-record/ui/RecordTable";

import {
    TimerActionColumn,
    DealNameColumn,
    WorkNameColumn,
    TaskNameColumn,
    CategoryColumn,
    DurationColumn,
    TimeRangeColumn,
    DateColumn,
    ActionsColumn,
} from "../features/work-record/ui/RecordColumns";

import {
    RecordAddModal,
    RecordEditModal,
} from "../features/work-record/ui/RecordModals";

import {
    CompletedModal,
    TrashModal,
} from "../features/work-record/ui/CompletedRecords";
import { SessionEditTable } from "../features/work-record/ui/SessionEditor";

// Constants
import {
    RECORD_SUCCESS,
    RECORD_EMPTY,
} from "../features/work-record/constants";

/**
 * 작업 레코드 테이블 메인 컴포넌트
 */
export default function WorkRecordTable() {
    // ============================================
    // Store & State
    // ============================================
    const { is_mobile } = useResponsive();
    const {
        selected_date,
        setSelectedDate,
        timer,
        getElapsedSeconds,
        softDeleteRecord,
        app_theme,
        records,
    } = useWorkStore();

    const shortcut_store = useShortcutStore();
    const theme_color = String(
        APP_THEME_COLORS[app_theme] || APP_THEME_COLORS.blue
    );

    // ============================================
    // Custom Hooks
    // ============================================
    const [search_text] = useDebouncedValue("", 300);

    const { display_records, completed_records, deleted_records } =
        useRecordData(search_text);

    const { today_stats } = useRecordStats();

    const { startTimer, stopTimer, active_record_id } = useRecordTimer();

    const {
        markAsCompleted,
        markAsIncomplete,
        restoreRecord,
        permanentlyDeleteRecord,
    } = useRecordActions();

    const {
        is_add_open,
        is_edit_open,
        is_completed_open,
        is_trash_open,
        editing_record_id,
        openAddModal,
        closeAddModal,
        openEditModal,
        closeEditModal,
        openCompletedModal,
        closeCompletedModal,
        openTrashModal,
        closeTrashModal,
    } = useRecordModals();

    // ============================================
    // Handlers
    // ============================================
    const handleToggleRecord = useCallback(
        (record: WorkRecord) => {
            if (active_record_id === record.id && timer.is_running) {
                stopTimer();
            } else {
                startTimer(record.id);
            }
        },
        [active_record_id, timer.is_running, startTimer, stopTimer]
    );

    const handleOpenEditModal = useCallback(
        (record: WorkRecord) => {
            openEditModal(record.id);
        },
        [openEditModal]
    );

    const handleDelete = useCallback(
        (record_id: string) => {
            softDeleteRecord(record_id);
            message.success(RECORD_SUCCESS.DELETED);
        },
        [softDeleteRecord]
    );

    const handleCopyToClipboard = useCallback(() => {
        const filtered = display_records.filter((r) => !r.is_deleted);

        if (filtered.length === 0) {
            message.warning("복사할 작업이 없습니다");
            return;
        }

        // 마크다운 표 형식으로 복사
        const columns = ["거래명", "작업명", "시간", "카테고리", "비고"];
        const data = filtered.map((r) => [
            r.deal_name || r.work_name,
            r.work_name,
            `${r.duration_minutes}분`,
            r.category_name || "",
            r.note || "",
        ]);

        // 문자열 디스플레이 너비 계산 (한글 2바이트, 영문 1바이트)
        const getDisplayWidth = (str: string) => {
            let width = 0;
            for (const char of str) {
                width += char.charCodeAt(0) > 127 ? 2 : 1;
            }
            return width;
        };

        const col_widths = columns.map((col, i) => {
            const header_width = getDisplayWidth(col);
            const max_data_width = data.reduce(
                (max, row) => Math.max(max, getDisplayWidth(row[i])),
                0
            );
            return Math.max(header_width, max_data_width);
        });

        // 문자열 패딩
        const padString = (str: string, width: number) => {
            const display_width = getDisplayWidth(str);
            const padding = width - display_width;
            return str + " ".repeat(Math.max(0, padding));
        };

        // 마크다운 표 생성
        const header_row =
            "| " +
            columns.map((col, i) => padString(col, col_widths[i])).join(" | ") +
            " |";
        const separator =
            "|" + col_widths.map((w) => "-".repeat(w + 2)).join("|") + "|";
        const data_rows = data.map(
            (row) =>
                "| " +
                row
                    .map((cell, i) => padString(cell, col_widths[i]))
                    .join(" | ") +
                " |"
        );

        const text = [header_row, separator, ...data_rows].join("\n");
        navigator.clipboard.writeText(text);
        message.success("클립보드에 복사되었습니다");
    }, [display_records]);

    const handlePrevDay = useCallback(() => {
        setSelectedDate(
            dayjs(selected_date).subtract(1, "day").format("YYYY-MM-DD")
        );
    }, [selected_date, setSelectedDate]);

    const handleNextDay = useCallback(() => {
        setSelectedDate(
            dayjs(selected_date).add(1, "day").format("YYYY-MM-DD")
        );
    }, [selected_date, setSelectedDate]);

    const handleDateChange = useCallback(
        (date: dayjs.Dayjs | null) => {
            setSelectedDate(
                date?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD")
            );
        },
        [setSelectedDate]
    );

    // ============================================
    // Table Columns (컴포넌트 참조만)
    // ============================================
    const columns: ColumnsType<WorkRecord> = useMemo(
        () => [
            {
                title: "",
                key: "timer_action",
                width: 50,
                align: "center",
                render: (_, record) => (
                    <TimerActionColumn
                        record={record}
                        is_active={active_record_id === record.id}
                        is_timer_running={timer.is_running}
                        onToggle={handleToggleRecord}
                    />
                ),
            },
            {
                title: "거래명",
                dataIndex: "deal_name",
                key: "deal_name",
                width: 200,
                render: (_, record) => (
                    <DealNameColumn
                        record={record}
                        is_active={active_record_id === record.id}
                        is_completed={record.is_completed}
                        theme_color={theme_color}
                        elapsed_seconds={getElapsedSeconds()}
                    />
                ),
            },
            {
                title: "작업명",
                dataIndex: "work_name",
                key: "work_name",
                width: 120,
                render: (_, record) => (
                    <WorkNameColumn record={record} theme_color={theme_color} />
                ),
            },
            {
                title: "업무명",
                dataIndex: "task_name",
                key: "task_name",
                width: 80,
                render: (_, record) => <TaskNameColumn record={record} />,
            },
            {
                title: "카테고리",
                dataIndex: "category_name",
                key: "category_name",
                width: 90,
                render: (_, record) => <CategoryColumn record={record} />,
            },
            {
                title: "시간",
                dataIndex: "duration_minutes",
                key: "duration_minutes",
                width: 60,
                align: "center",
                render: (_, record) => (
                    <DurationColumn
                        record={record}
                        selected_date={selected_date}
                        theme_color={theme_color}
                    />
                ),
            },
            {
                title: "시작-종료",
                key: "time_range",
                width: 120,
                render: (_, record) => (
                    <TimeRangeColumn
                        record={record}
                        selected_date={selected_date}
                    />
                ),
            },
            {
                title: "날짜",
                dataIndex: "date",
                key: "date",
                width: 90,
                render: (date: string) => <DateColumn date={date} />,
            },
            {
                title: "",
                key: "action",
                width: 120,
                render: (_, record) => (
                    <ActionsColumn
                        record={record}
                        is_active={record.id === active_record_id}
                        onComplete={(r) => markAsCompleted(r.id)}
                        onUncomplete={(r) => markAsIncomplete(r.id)}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                    />
                ),
            },
        ],
        [
            active_record_id,
            timer.is_running,
            theme_color,
            getElapsedSeconds,
            selected_date,
            handleToggleRecord,
            markAsCompleted,
            markAsIncomplete,
            handleOpenEditModal,
            handleDelete,
        ]
    );

    // ============================================
    // Expanded Row Render
    // ============================================
    const expandedRowRender = useCallback(
        (record: WorkRecord) => <SessionEditTable record_id={record.id} />,
        []
    );

    // ============================================
    // Shortcuts
    // ============================================
    const new_work_keys = shortcut_store.getShortcut("new-work")?.keys || "";
    const prev_day_keys = shortcut_store.getShortcut("prev-day")?.keys || "";
    const next_day_keys = shortcut_store.getShortcut("next-day")?.keys || "";

    // ============================================
    // Render
    // ============================================
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
                        {/* 날짜 네비게이션 */}
                        <Space.Compact>
                            <Tooltip
                                title={`이전 날짜 (${formatShortcutKeyForPlatform(
                                    prev_day_keys
                                )})`}
                            >
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={handlePrevDay}
                                />
                            </Tooltip>
                            <DatePicker
                                value={dayjs(selected_date)}
                                onChange={handleDateChange}
                                format="YYYY-MM-DD (dd)"
                                allowClear={false}
                                style={
                                    is_mobile ? { width: 130 } : { width: 150 }
                                }
                            />
                            <Tooltip
                                title={`다음 날짜 (${formatShortcutKeyForPlatform(
                                    next_day_keys
                                )})`}
                            >
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={handleNextDay}
                                />
                            </Tooltip>
                        </Space.Compact>

                        {/* 주요 액션 버튼 */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openAddModal}
                        >
                            {!is_mobile && (
                                <>
                                    새 작업{" "}
                                    <span
                                        style={{
                                            fontSize: 11,
                                            opacity: 0.85,
                                            marginLeft: 4,
                                            padding: "1px 4px",
                                            background: "rgba(255,255,255,0.2)",
                                            borderRadius: 3,
                                        }}
                                    >
                                        {formatShortcutKeyForPlatform(
                                            new_work_keys
                                        )}
                                    </span>
                                </>
                            )}
                        </Button>

                        {/* 보조 액션 버튼들 */}
                        <Tooltip title="완료된 작업 목록">
                            <Button
                                icon={
                                    <CheckCircleOutlined
                                        style={{ color: "#52c41a" }}
                                    />
                                }
                                onClick={openCompletedModal}
                            >
                                {!is_mobile && "완료"}
                            </Button>
                        </Tooltip>

                        <Tooltip title="삭제된 작업 (복구 가능)">
                            <Button
                                icon={
                                    <DeleteOutlined
                                        style={{ color: "#ff4d4f" }}
                                    />
                                }
                                onClick={openTrashModal}
                            >
                                {!is_mobile && "휴지통"}
                            </Button>
                        </Tooltip>

                        <Tooltip title="시간 관리 양식으로 복사">
                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopyToClipboard}
                                disabled={display_records.length === 0}
                            >
                                {!is_mobile && "내역 복사"}
                            </Button>
                        </Tooltip>
                    </Space>
                }
            >
                {/* 통계 패널 */}
                <DailyStats stats={today_stats} />

                {/* 테이블 */}
                <Table
                    dataSource={display_records}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    expandable={{
                        expandedRowRender,
                        rowExpandable: (record) =>
                            !!(record.sessions && record.sessions.length > 0),
                    }}
                    locale={{
                        emptyText: RECORD_EMPTY.NO_RECORDS,
                    }}
                />
            </Card>

            {/* 작업 추가 모달 */}
            <RecordAddModal open={is_add_open} onClose={closeAddModal} />

            {/* 작업 수정 모달 */}
            <RecordEditModal
                open={is_edit_open}
                onClose={closeEditModal}
                record={
                    editing_record_id
                        ? records.find((r) => r.id === editing_record_id) ||
                          null
                        : null
                }
            />

            {/* 완료 목록 모달 */}
            <CompletedModal
                open={is_completed_open}
                on_close={closeCompletedModal}
                records={completed_records}
                on_restore={(r) => markAsIncomplete(r.id)}
            />

            {/* 휴지통 모달 */}
            <TrashModal
                open={is_trash_open}
                on_close={closeTrashModal}
                records={deleted_records}
                on_restore={(r) => restoreRecord(r.id)}
                on_permanent_delete={(r) => permanentlyDeleteRecord(r.id)}
            />
        </>
    );
}
