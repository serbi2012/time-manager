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
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import { useShallow } from "zustand/react/shallow";
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
import { RecordCopyModal } from "../RecordCopyModal";
import { CompletedModal, TrashModal } from "../CompletedRecords";

import { DATE_FORMAT, MOBILE_RECORD_LABEL } from "../../constants";

import { MobileDateHeader } from "./MobileDateHeader";
import { MobileCalendarStrip } from "./MobileCalendarStrip";
import { MobileRunningSection } from "./MobileRunningSection";
import { MobileRecordList } from "./MobileRecordList";

export function MobileWorkRecordTable() {
    // ============================================
    // Store
    // ============================================
    const { selected_date, setSelectedDate, records } = useWorkStore(
        useShallow((s) => ({
            selected_date: s.selected_date,
            setSelectedDate: s.setSelectedDate,
            records: s.records,
        }))
    );

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
        is_copy_open,
        editing_record_id,
        closeAddModal,
        openEditModal,
        closeEditModal,
        openCompletedModal,
        closeCompletedModal,
        openTrashModal,
        closeTrashModal,
        openCopyModal,
        closeCopyModal,
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
                if (record.is_completed) markAsIncomplete(record.id);
                startTimer(record.id);
            }
        },
        [active_record_id, is_timer_running, startTimer, stopTimer, markAsIncomplete]
    );

    const handleEditRecord = useCallback(
        (record: WorkRecord) => {
            openEditModal(record.id);
        },
        [openEditModal]
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

    const handleComplete = useCallback(
        (r: WorkRecord) => markAsCompleted(r.id),
        [markAsCompleted]
    );

    const handleDeleteRecord = useCallback(
        (r: WorkRecord) => deleteRecord(r.id),
        [deleteRecord]
    );

    const handleRestore = useCallback(
        (r: WorkRecord) => restoreRecord(r.id),
        [restoreRecord]
    );

    const handleUncomplete = useCallback(
        (r: WorkRecord) => markAsIncomplete(r.id),
        [markAsIncomplete]
    );

    const handlePermanentDelete = useCallback(
        (r: WorkRecord) => permanentlyDeleteRecord(r.id),
        [permanentlyDeleteRecord]
    );

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
                    onEdit={handleEditRecord}
                    onComplete={handleComplete}
                    onDelete={handleDeleteRecord}
                    animation_key={animation_key}
                />

                {/* Record list */}
                <MobileRecordList
                    records={other_records}
                    active_record_id={active_record_id}
                    onToggle={handleToggleRecord}
                    onEdit={handleEditRecord}
                    onOpenCompleted={openCompletedModal}
                    onOpenTrash={openTrashModal}
                    onCopyRecords={openCopyModal}
                    onComplete={handleComplete}
                    onDelete={handleDeleteRecord}
                    animation_key={animation_key}
                />
            </div>

            {/* Bottom spacer for FAB area */}
            <div className="h-20" />

            {/* Modals */}
            <RecordCopyModal
                open={is_copy_open}
                records={display_records}
                selected_date={selected_date}
                onClose={closeCopyModal}
            />

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
                on_restore={handleUncomplete}
            />

            <TrashModal
                open={is_trash_open}
                on_close={closeTrashModal}
                records={deleted_records}
                on_restore={handleRestore}
                on_permanent_delete={handlePermanentDelete}
            />
        </>
    );
}
