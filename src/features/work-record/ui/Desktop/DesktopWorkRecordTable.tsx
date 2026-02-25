/**
 * Desktop work record table (Toss-style redesign)
 *
 * Replaces Ant Design Card wrapper with custom container.
 * Uses RecordHeader for date navigation, stats, and actions.
 * Ant Design Table is retained with CSS overrides for Toss styling.
 */

import { useCallback } from "react";
import { Table } from "antd";
import { message } from "@/shared/lib/message";
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";
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
import {
    useRecordData,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
    useRecordColumns,
} from "../../hooks";

// Features - UI Components
import { RecordAddModal, RecordEditModal } from "../RecordModals";
import { CompletedModal, TrashModal } from "../CompletedRecords";
import { SessionEditTable } from "../SessionEditor";
import { RecordHeader } from "./RecordHeader";
import { RecordEmptyState } from "./RecordEmptyState";
import { RecordFooter } from "./RecordFooter";
import { SpotlightCard } from "@/shared/ui/cursor-tracking";

// Lib
import { formatRecordsToMarkdown } from "../../lib/markdown_formatter";

// Constants
import { RECORD_SUCCESS, RECORD_WARNING, DATE_FORMAT } from "../../constants";

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
        const text = formatRecordsToMarkdown(display_records, selected_date);
        if (!text) {
            message.warning(RECORD_WARNING.NO_RECORDS_TO_COPY);
            return;
        }
        navigator.clipboard.writeText(text);
        message.success(RECORD_SUCCESS.COPIED_TO_CLIPBOARD);
    }, [display_records, selected_date]);

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
    // Table Columns (extracted hook)
    // ============================================
    const columns = useRecordColumns({
        active_record_id,
        is_timer_running: timer.is_running,
        theme_color,
        selected_date,
        getElapsedSeconds,
        onToggle: handleToggleRecord,
        onComplete: (r) => markAsCompleted(r.id),
        onUncomplete: (r) => markAsIncomplete(r.id),
        onEdit: handleOpenEditModal,
        onDelete: handleDelete,
    });

    // ============================================
    // Expanded Row Render
    // ============================================
    const expandedRowRender = useCallback(
        (record: WorkRecord) => <SessionEditTable record_id={record.id} />,
        []
    );

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
            <SpotlightCard className="toss-record-table bg-white rounded-xl overflow-hidden">
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

                <RecordFooter
                    record_count={display_records.length}
                    onOpenCompleted={openCompletedModal}
                    onOpenTrash={openTrashModal}
                    onCopyRecords={handleCopyToClipboard}
                />
            </SpotlightCard>

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
