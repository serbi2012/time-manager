/**
 * Desktop work record table (Toss-style redesign)
 *
 * Replaces Ant Design Card wrapper with custom container.
 * Uses RecordHeader for date navigation, stats, and actions.
 * Ant Design Table is retained with CSS overrides for Toss styling.
 */

import { useMemo, useCallback } from "react";
import { Table } from "antd";
import { message } from "../../../../shared/lib/message";
import {
    CheckCircleOutlined,
    DeleteOutlined,
    CopyOutlined,
    CaretDownOutlined,
    CaretRightOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
    motion,
    AnimatePresence,
    SPRING,
} from "../../../../shared/ui/animation";

// Store
import { useWorkStore, APP_THEME_COLORS } from "../../../../store/useWorkStore";
import { useShortcutStore } from "../../../../store/useShortcutStore";

// Types
import type { WorkRecord } from "../../../../types";

// Hooks
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";

// Features - Hooks
import {
    useRecordData,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
} from "../../hooks";

// Features - UI Components
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
import { RecordHeader } from "./RecordHeader";
import { RecordEmptyState } from "./RecordEmptyState";

// Constants
import {
    RECORD_SUCCESS,
    RECORD_WARNING,
    RECORD_TABLE_COLUMN,
    RECORD_BUTTON,
    RECORD_UI_TEXT,
    MARKDOWN_COPY,
    RECORD_COLUMN_WIDTH,
    DATE_FORMAT,
    CHAR_CODE_THRESHOLD,
    HANGUL_CHAR_WIDTH,
    ASCII_CHAR_WIDTH,
} from "../../constants";

const FOOTER_TOTAL_PREFIX = "총";
const FOOTER_TOTAL_SUFFIX = "건";

export function DesktopWorkRecordTable() {
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

        const columns = MARKDOWN_COPY.COLUMNS;
        const data = filtered.map((r) => [
            r.deal_name || r.work_name,
            r.work_name,
            `${r.duration_minutes}${RECORD_UI_TEXT.MINUTE_UNIT}`,
            r.category_name || "",
            r.note || "",
        ]);

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

        const padString = (str: string, width: number) => {
            const display_width = getDisplayWidth(str);
            const padding = width - display_width;
            return str + " ".repeat(Math.max(0, padding));
        };

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

    const handleDateSelect = useCallback(
        (date_str: string) => {
            setSelectedDate(date_str);
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
                render: (_, record) => (
                    <WorkNameColumn
                        record={record}
                        is_active={active_record_id === record.id}
                    />
                ),
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

    // Custom expand icon (▸/▾)
    const customExpandIcon = useCallback(
        ({
            expanded,
            onExpand,
            record,
        }: {
            expanded: boolean;
            onExpand: (
                record: WorkRecord,
                e: React.MouseEvent<HTMLElement>
            ) => void;
            record: WorkRecord;
        }) => {
            if (!record.sessions || record.sessions.length === 0) {
                return <span className="inline-block w-6" />;
            }
            return (
                <button
                    className="w-6 h-6 border-0 bg-transparent rounded flex items-center justify-center hover:bg-bg-grey transition-colors text-text-disabled cursor-pointer"
                    onClick={(e) => onExpand(record, e)}
                >
                    {expanded ? (
                        <CaretDownOutlined style={{ fontSize: 10 }} />
                    ) : (
                        <CaretRightOutlined style={{ fontSize: 10 }} />
                    )}
                </button>
            );
        },
        []
    );

    // ============================================
    // Shortcuts
    // ============================================
    const new_work_keys = shortcut_store.getShortcut("new-work")?.keys || "";

    // ============================================
    // Render
    // ============================================
    return (
        <>
            <div className="toss-record-table bg-white rounded-xl overflow-hidden">
                {/* Header */}
                <RecordHeader
                    selected_date={selected_date}
                    onDateChange={handleDateChange}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                    onDateSelect={handleDateSelect}
                    records={records}
                    onAddNew={openAddModal}
                    onOpenCompleted={openCompletedModal}
                    onOpenTrash={openTrashModal}
                    onCopyRecords={handleCopyToClipboard}
                    new_work_shortcut_keys={new_work_keys}
                    disabled_copy={display_records.length === 0}
                />

                {/* 2-1: Table with stagger entrance on date change */}
                <div className="px-xl pb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selected_date}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={SPRING.toss}
                        >
                            <Table
                                dataSource={display_records}
                                columns={columns}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                className="toss-table"
                                expandable={{
                                    expandedRowRender,
                                    expandIcon: customExpandIcon,
                                    rowExpandable: (record) =>
                                        !!(
                                            record.sessions &&
                                            record.sessions.length > 0
                                        ),
                                }}
                                rowClassName={(record) =>
                                    record.id === active_record_id
                                        ? "toss-active-row"
                                        : ""
                                }
                                locale={{
                                    emptyText: (
                                        <RecordEmptyState
                                            onAddNew={openAddModal}
                                        />
                                    ),
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-xl py-md flex items-center justify-between border-t border-border-light mt-sm">
                    <span className="text-sm text-text-secondary">
                        {FOOTER_TOTAL_PREFIX} {display_records.length}
                        {FOOTER_TOTAL_SUFFIX}
                    </span>
                    <div className="toss-footer-actions flex items-center gap-sm">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="h-8 px-md rounded-md flex items-center gap-xs hover:bg-bg-grey transition-colors text-sm text-text-secondary cursor-pointer"
                            onClick={openCompletedModal}
                        >
                            <CheckCircleOutlined
                                style={{
                                    color: "var(--color-success)",
                                    fontSize: 13,
                                }}
                            />
                            {RECORD_BUTTON.VIEW_COMPLETED} 목록
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="h-8 px-md rounded-md flex items-center gap-xs hover:bg-bg-grey transition-colors text-sm text-text-secondary cursor-pointer"
                            onClick={openTrashModal}
                        >
                            <DeleteOutlined
                                style={{
                                    color: "var(--color-error)",
                                    fontSize: 13,
                                }}
                            />
                            {RECORD_BUTTON.VIEW_TRASH}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="h-8 px-md rounded-md flex items-center gap-xs hover:bg-bg-grey transition-colors text-sm text-text-secondary cursor-pointer"
                            onClick={handleCopyToClipboard}
                        >
                            <CopyOutlined style={{ fontSize: 13 }} />
                            {RECORD_BUTTON.COPY_RECORDS}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <RecordAddModal open={is_add_open} onClose={closeAddModal} />

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

            <CompletedModal
                open={is_completed_open}
                on_close={closeCompletedModal}
                records={completed_records}
                on_restore={(r) => markAsIncomplete(r.id)}
            />

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
