/**
 * Mobile work record table — B4 redesign
 *
 * Layout:
 * - Sticky header: DateHeader + CalendarStrip
 * - Running section: active records with red border
 * - Record list: remaining records with action icons
 * - FAB: floating add button
 * - Modals: add/edit/completed/trash
 */

import { useState, useCallback, useMemo } from "react";
import { message } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import { useWorkStore } from "../../../../store/useWorkStore";
import type { WorkRecord } from "../../../../shared/types";
import { cn } from "../../../../shared/lib/cn";

import {
    useRecordData,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
} from "../../hooks";

import { RecordAddModal, RecordEditModal } from "../RecordModals";
import { CompletedModal, TrashModal } from "../CompletedRecords";

import {
    DATE_FORMAT,
    RECORD_SUCCESS,
    RECORD_WARNING,
    MARKDOWN_COPY,
    RECORD_UI_TEXT,
    MOBILE_RECORD_LABEL,
    CHAR_CODE_THRESHOLD,
    HANGUL_CHAR_WIDTH,
    ASCII_CHAR_WIDTH,
} from "../../constants";

import { MobileDateHeader } from "./MobileDateHeader";
import { MobileCalendarStrip } from "./MobileCalendarStrip";
import { MobileRunningSection } from "./MobileRunningSection";
import { MobileRecordList } from "./MobileRecordList";

export function MobileWorkRecordTable() {
    // ============================================
    // Store
    // ============================================
    const { selected_date, setSelectedDate, records } = useWorkStore();

    // ============================================
    // Hooks
    // ============================================
    const { display_records, completed_records, deleted_records } =
        useRecordData("");

    const {
        active_record_id,
        elapsed_seconds,
        startTimer,
        stopTimer,
        is_timer_running,
    } = useRecordTimer();

    const {
        deleteRecord,
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
        closeAddModal,
        closeEditModal,
        openCompletedModal,
        closeCompletedModal,
        openTrashModal,
        closeTrashModal,
    } = useRecordModals();

    // ============================================
    // Local state
    // ============================================
    const [is_calendar_open, setIsCalendarOpen] = useState(true);

    // Animation key — changes on date change to re-trigger entrance animations
    const animation_key = selected_date;

    // ============================================
    // Derived data
    // ============================================
    const total_minutes = useMemo(
        () => display_records.reduce((sum, r) => sum + r.duration_minutes, 0),
        [display_records]
    );

    const running_records = useMemo(
        () =>
            display_records.filter(
                (r) => r.id === active_record_id && is_timer_running
            ),
        [display_records, active_record_id, is_timer_running]
    );

    const other_records = useMemo(
        () =>
            display_records.filter(
                (r) => !(r.id === active_record_id && is_timer_running)
            ),
        [display_records, active_record_id, is_timer_running]
    );

    // ============================================
    // Handlers
    // ============================================
    const handleToggleRecord = useCallback(
        (record: WorkRecord) => {
            if (active_record_id === record.id && is_timer_running) {
                stopTimer();
            } else {
                startTimer(record.id);
            }
        },
        [active_record_id, is_timer_running, startTimer, stopTimer]
    );

    const handlePrevDay = useCallback(() => {
        setSelectedDate(
            dayjs(selected_date).subtract(1, "day").format(DATE_FORMAT)
        );
    }, [selected_date, setSelectedDate]);

    const handleNextDay = useCallback(() => {
        setSelectedDate(dayjs(selected_date).add(1, "day").format(DATE_FORMAT));
    }, [selected_date, setSelectedDate]);

    const handleDateChange = useCallback(
        (date: Dayjs | null) => {
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

    // ============================================
    // Render
    // ============================================
    return (
        <>
            {/* Unified container — header + list as one body */}
            <div className="rounded-xl bg-bg-default overflow-hidden shadow-xs">
                {/* Sticky header */}
                <div className="mobile-record-sticky-header">
                    {/* Date navigation + total time */}
                    <MobileDateHeader
                        selected_date={selected_date}
                        total_minutes={total_minutes}
                        onPrevDay={handlePrevDay}
                        onNextDay={handleNextDay}
                        onDateChange={handleDateChange}
                    />

                    {/* Calendar strip toggle + strip */}
                    <div className="flex items-center justify-end px-lg pb-[2px]">
                        <button
                            className={cn(
                                "flex items-center gap-[3px] px-sm py-[3px] rounded-full border-0 text-xs font-medium cursor-pointer transition-all",
                                is_calendar_open
                                    ? "bg-primary-light text-primary"
                                    : "bg-bg-grey text-text-secondary"
                            )}
                            onClick={() => setIsCalendarOpen((prev) => !prev)}
                        >
                            <CalendarOutlined style={{ fontSize: 11 }} />
                            {MOBILE_RECORD_LABEL.WEEKLY_TOGGLE}
                        </button>
                    </div>

                    {is_calendar_open && (
                        <MobileCalendarStrip
                            selected_date={selected_date}
                            onDateSelect={handleDateSelect}
                            records={records}
                        />
                    )}
                </div>

                {/* Running section */}
                <MobileRunningSection
                    records={running_records}
                    active_record_id={active_record_id}
                    elapsed_seconds={elapsed_seconds}
                    onToggle={handleToggleRecord}
                    animation_key={animation_key}
                />

                {/* Record list */}
                <MobileRecordList
                    records={other_records}
                    active_record_id={active_record_id}
                    onToggle={handleToggleRecord}
                    onOpenCompleted={openCompletedModal}
                    onOpenTrash={openTrashModal}
                    onCopyRecords={handleCopyToClipboard}
                    onComplete={(r) => markAsCompleted(r.id)}
                    onDelete={(r) => deleteRecord(r.id)}
                    animation_key={animation_key}
                />
            </div>

            {/* Bottom spacer for FAB area */}
            <div className="h-20" />

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
