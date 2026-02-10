/**
 * Mobile 전용 작업 레코드 테이블 컴포넌트
 *
 * Mobile 특화 UI:
 * - Space size: tiny
 * - DatePicker width: 80px
 * - 버튼 아이콘만 표시 (텍스트/단축키 힌트 없음)
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
import { useWorkStore, APP_THEME_COLORS } from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";

// Types
import type { WorkRecord } from "../../../../types";

// Hooks
import { formatShortcutKeyForPlatform } from "../../../../hooks/useShortcuts";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";

// Features - Hooks
import {
    useRecordData,
    useRecordStats,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
} from "../../hooks";

// Features - UI Components
import { DailyStats } from "../RecordTable";

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
} from "../RecordColumns";

import { RecordAddModal, RecordEditModal } from "../RecordModals";

import { CompletedModal, TrashModal } from "../CompletedRecords";
import { SessionEditTable } from "../SessionEditor";

// Constants
import {
    RECORD_SUCCESS,
    RECORD_EMPTY,
    RECORD_WARNING,
    RECORD_TABLE_COLUMN,
    RECORD_TOOLTIP,
    RECORD_UI_TEXT,
    MARKDOWN_COPY,
    RECORD_COLUMN_WIDTH,
    RECORD_SPACING,
    DATE_FORMAT,
    DATE_FORMAT_WITH_DAY,
    CHAR_CODE_THRESHOLD,
    HANGUL_CHAR_WIDTH,
    ASCII_CHAR_WIDTH,
} from "../../constants";

export function MobileWorkRecordTable() {
    // ============================================
    // Store & State
    // ============================================
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
            message.warning(RECORD_WARNING.NO_RECORDS_TO_COPY);
            return;
        }

        // 마크다운 표 형식으로 복사
        const columns = MARKDOWN_COPY.COLUMNS;
        const data = filtered.map((r) => [
            r.deal_name || r.work_name,
            r.work_name,
            `${r.duration_minutes}${RECORD_UI_TEXT.MINUTE_UNIT}`,
            r.category_name || "",
            r.note || "",
        ]);

        // 문자열 디스플레이 너비 계산
        const getDisplayWidth = (str: string) => {
            let width = 0;
            for (const char of str) {
                width +=
                    char.charCodeAt(0) > CHAR_CODE_THRESHOLD
                        ? HANGUL_CHAR_WIDTH
                        : ASCII_CHAR_WIDTH;
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
            MARKDOWN_COPY.CELL_PREFIX +
            columns
                .map((col, i) => padString(col, col_widths[i]))
                .join(MARKDOWN_COPY.CELL_SEPARATOR) +
            MARKDOWN_COPY.CELL_SUFFIX;
        const separator =
            MARKDOWN_COPY.ROW_SEPARATOR +
            col_widths
                .map((w) =>
                    MARKDOWN_COPY.HEADER_SEPARATOR.repeat(
                        w + MARKDOWN_COPY.PADDING_WIDTH
                    )
                )
                .join(MARKDOWN_COPY.ROW_SEPARATOR) +
            MARKDOWN_COPY.ROW_SEPARATOR;
        const data_rows = data.map(
            (row) =>
                MARKDOWN_COPY.CELL_PREFIX +
                row
                    .map((cell, i) => padString(cell, col_widths[i]))
                    .join(MARKDOWN_COPY.CELL_SEPARATOR) +
                MARKDOWN_COPY.CELL_SUFFIX
        );

        const text = [header_row, separator, ...data_rows].join(
            MARKDOWN_COPY.LINE_BREAK
        );
        navigator.clipboard.writeText(text);
        message.success(RECORD_SUCCESS.COPIED_TO_CLIPBOARD);
    }, [display_records]);

    const handlePrevDay = useCallback(() => {
        setSelectedDate(
            dayjs(selected_date).subtract(1, "day").format(DATE_FORMAT)
        );
    }, [selected_date, setSelectedDate]);

    const handleNextDay = useCallback(() => {
        setSelectedDate(dayjs(selected_date).add(1, "day").format(DATE_FORMAT));
    }, [selected_date, setSelectedDate]);

    const handleDateChange = useCallback(
        (date: dayjs.Dayjs | null) => {
            setSelectedDate(
                date?.format(DATE_FORMAT) || dayjs().format(DATE_FORMAT)
            );
        },
        [setSelectedDate]
    );

    // ============================================
    // Table Columns
    // ============================================
    const columns: ColumnsType<WorkRecord> = useMemo(
        () => [
            {
                title: "",
                key: "timer_action",
                width: RECORD_COLUMN_WIDTH.TIMER_ACTION,
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
                title: RECORD_TABLE_COLUMN.DEAL_NAME,
                dataIndex: "deal_name",
                key: "deal_name",
                width: RECORD_COLUMN_WIDTH.DEAL_NAME,
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
                title: RECORD_TABLE_COLUMN.WORK_NAME,
                dataIndex: "work_name",
                key: "work_name",
                width: RECORD_COLUMN_WIDTH.WORK_NAME,
                render: (_, record) => <WorkNameColumn record={record} />,
            },
            {
                title: RECORD_TABLE_COLUMN.TASK_NAME,
                dataIndex: "task_name",
                key: "task_name",
                width: RECORD_COLUMN_WIDTH.TASK_NAME,
                render: (_, record) => <TaskNameColumn record={record} />,
            },
            {
                title: RECORD_TABLE_COLUMN.CATEGORY,
                dataIndex: "category_name",
                key: "category_name",
                width: RECORD_COLUMN_WIDTH.CATEGORY,
                render: (_, record) => <CategoryColumn record={record} />,
            },
            {
                title: RECORD_TABLE_COLUMN.TIME,
                dataIndex: "duration_minutes",
                key: "duration_minutes",
                width: RECORD_COLUMN_WIDTH.DURATION,
                align: "center",
                render: (_, record) => (
                    <DurationColumn
                        record={record}
                        selected_date={selected_date}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.TIME_RANGE,
                key: "time_range",
                width: RECORD_COLUMN_WIDTH.TIME_RANGE,
                render: (_, record) => (
                    <TimeRangeColumn
                        record={record}
                        selected_date={selected_date}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.DATE,
                dataIndex: "date",
                key: "date",
                width: RECORD_COLUMN_WIDTH.DATE,
                render: (date: string) => <DateColumn date={date} />,
            },
            {
                title: "",
                key: "action",
                width: RECORD_COLUMN_WIDTH.ACTIONS,
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
                        <span>{RECORD_UI_TEXT.CARD_TITLE}</span>
                        {timer.is_running && timer.active_form_data && (
                            <Tag
                                color={theme_color}
                                icon={<ClockCircleOutlined spin />}
                            >
                                {timer.active_form_data.deal_name ||
                                    timer.active_form_data.work_name}{" "}
                                {RECORD_UI_TEXT.TIMER_RUNNING_SUFFIX}
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Space size={RECORD_SPACING.TINY} wrap>
                        {/* 날짜 네비게이션 */}
                        <Space.Compact>
                            <Tooltip
                                title={RECORD_TOOLTIP.PREVIOUS_DATE(
                                    formatShortcutKeyForPlatform(prev_day_keys)
                                )}
                            >
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={handlePrevDay}
                                />
                            </Tooltip>
                            <DatePicker
                                value={dayjs(selected_date)}
                                onChange={handleDateChange}
                                format={DATE_FORMAT_WITH_DAY}
                                allowClear={false}
                                className="!w-[130px]"
                            />
                            <Tooltip
                                title={RECORD_TOOLTIP.NEXT_DATE(
                                    formatShortcutKeyForPlatform(next_day_keys)
                                )}
                            >
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={handleNextDay}
                                />
                            </Tooltip>
                        </Space.Compact>

                        {/* 주요 액션 버튼 (아이콘만) */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openAddModal}
                        />

                        {/* 보조 액션 버튼들 (아이콘만) */}
                        <Tooltip title={RECORD_TOOLTIP.COMPLETED_LIST}>
                            <Button
                                icon={
                                    <CheckCircleOutlined className="!text-success" />
                                }
                                onClick={openCompletedModal}
                            />
                        </Tooltip>

                        <Tooltip title={RECORD_TOOLTIP.TRASH_LIST}>
                            <Button
                                icon={
                                    <DeleteOutlined className="!text-error" />
                                }
                                onClick={openTrashModal}
                            />
                        </Tooltip>

                        <Tooltip title={RECORD_TOOLTIP.COPY_RECORDS}>
                            <Button
                                icon={<CopyOutlined />}
                                onClick={handleCopyToClipboard}
                                disabled={display_records.length === 0}
                            />
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
