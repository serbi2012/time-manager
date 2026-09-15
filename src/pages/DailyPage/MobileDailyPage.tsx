/**
 * Mobile daily page — redesigned layout
 * Sticky header + scrollable content (timer card + task list)
 */

import { useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";

import { useWorkStore } from "../../store/useWorkStore";
import {
    useRecordCreation,
    useSwipeNavigation,
    usePullToRefresh,
} from "../../shared/hooks";
import { useSyncStatusContext } from "../../features/sync";
import type { WorkRecord } from "../../shared/types";

import {
    useRecordData,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
} from "../../features/work-record/hooks";

import { MobileRecordFormSheet } from "../../features/work-record/ui/Mobile/MobileRecordFormSheet";
import { RecordCopyModal } from "../../features/work-record/ui/RecordCopyModal";
import { MobileRecordListSheet } from "../../features/work-record/ui/Mobile/MobileRecordListSheet";
import { MobileRunningSection } from "../../features/work-record/ui/Mobile/MobileRunningSection";
import { MobileRecordList } from "../../features/work-record/ui/Mobile/MobileRecordList";
import { MobileSpeedDialFab } from "../../features/work-record/ui/Mobile/MobileSpeedDialFab";
import { MobileRecentWorkMenu } from "../../features/work-record/ui/Mobile/MobileRecentWorkMenu";
import {
    RECORD_MODAL_TITLE,
    RECORD_EMPTY,
    DATE_FORMAT,
} from "../../features/work-record/constants";
import { MobilePresetSheet } from "../../features/work-template/ui";


import {
    SlideIn,
    FadeIn,
    MobilePullIndicator,
    usePageTransitionContext,
    MOBILE_DAILY_DELAYS,
} from "../../shared/ui";

import { MobileDailyHeader } from "./MobileDailyHeader";
import { MobileDailyTimeline } from "./MobileDailyTimeline";

/**
 * Mobile daily page — redesigned layout
 */
export function MobileDailyPage() {
    const [is_preset_sheet_open, setIsPresetSheetOpen] = useState(false);
    const app_theme = useWorkStore((state) => state.app_theme);
    const records = useWorkStore((state) => state.records);
    const selected_date = useWorkStore((state) => state.selected_date);
    const setSelectedDate = useWorkStore((state) => state.setSelectedDate);
    const { createFromTemplate } = useRecordCreation();

    const handleAddRecordOnly = (template_id: string) => {
        createFromTemplate(template_id);
        setIsPresetSheetOpen(false);
    };

    const { is_ready, transition_enabled, transition_speed } =
        usePageTransitionContext();

    const { handleManualSync } = useSyncStatusContext();

    const handlePrevDay = useCallback(() => {
        setSelectedDate(
            dayjs(selected_date).subtract(1, "day").format(DATE_FORMAT)
        );
    }, [selected_date, setSelectedDate]);

    const handleNextDay = useCallback(() => {
        setSelectedDate(dayjs(selected_date).add(1, "day").format(DATE_FORMAT));
    }, [selected_date, setSelectedDate]);

    const { handlers: swipe_handlers } = useSwipeNavigation({
        onSwipeLeft: handleNextDay,
        onSwipeRight: handlePrevDay,
    });

    const {
        pull_distance,
        is_ready: is_pull_ready,
        is_refreshing,
        handlers: pull_handlers,
    } = usePullToRefresh({ onRefresh: handleManualSync });

    // Record hooks
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

    const [recent_menu_open, setRecentMenuOpen] = useState(false);
    const [recent_menu_anchor, setRecentMenuAnchor] = useState<DOMRect | null>(null);

    const animation_key = selected_date;

    const running_records = useMemo(
        () =>
            display_records.filter(
                (r) => r.id === active_record_id && is_timer_running
            ),
        [display_records, active_record_id, is_timer_running]
    );

    const total_minutes = useMemo(
        () => display_records.reduce((sum, r) => sum + r.duration_minutes, 0),
        [display_records]
    );

    const other_records = useMemo(
        () =>
            display_records.filter(
                (r) => !(r.id === active_record_id && is_timer_running)
            ),
        [display_records, active_record_id, is_timer_running]
    );

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

    const handleEditRecord = useCallback(
        (record: WorkRecord) => {
            openEditModal(record.id);
        },
        [openEditModal]
    );

    const recent_works = useMemo(() => {
        const seen = new Set<string>();
        const result: { record_id: string; work_name: string; deal_name?: string }[] = [];
        const sorted = [...display_records]
            .filter((r) => !r.is_deleted && !r.is_completed)
            .sort((a, b) => {
                const a_time = a.sessions?.[a.sessions.length - 1]?.start_time || a.start_time || "";
                const b_time = b.sessions?.[b.sessions.length - 1]?.start_time || b.start_time || "";
                return b_time.localeCompare(a_time);
            });

        for (const r of sorted) {
            const key = `${r.work_name}__${r.deal_name || ""}`;
            if (seen.has(key)) continue;
            seen.add(key);
            result.push({
                record_id: r.id,
                work_name: r.work_name,
                deal_name: r.deal_name || undefined,
            });
            if (result.length >= 5) break;
        }
        return result;
    }, [display_records]);

    const handleFabLongPress = useCallback((anchor_rect: DOMRect) => {
        setRecentMenuAnchor(anchor_rect);
        setRecentMenuOpen(true);
    }, []);

    const handleRecentWorkSelect = useCallback(
        (record_id: string) => {
            startTimer(record_id);
        },
        [startTimer]
    );

    const handleStartRecordFromTemplate = useCallback(
        (template_id: string) => {
            const new_record = createFromTemplate(template_id);
            setIsPresetSheetOpen(false);
            if (new_record) {
                startTimer(new_record.id);
            }
        },
        [createFromTemplate, startTimer]
    );

    return (
        <div className="flex flex-col min-h-screen bg-bg-light">
            {/* Sticky Top Area */}
            <div className="sticky top-0 z-30">
                <SlideIn
                    direction="top"
                    show={is_ready}
                    delay={MOBILE_DAILY_DELAYS.header}
                    enabled={transition_enabled}
                    speed={transition_speed}
                >
                    <MobileDailyHeader total_minutes={total_minutes} />
                </SlideIn>
            </div>

            {/* Scrollable Content */}
            <SlideIn
                direction="bottom"
                show={is_ready}
                delay={MOBILE_DAILY_DELAYS.content}
                className="flex-1 pb-[90px]"
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <div
                    onTouchStart={(event) => {
                        swipe_handlers.onTouchStart(event);
                        pull_handlers.onTouchStart(event);
                    }}
                    onTouchMove={(event) => {
                        swipe_handlers.onTouchMove(event);
                        pull_handlers.onTouchMove(event);
                    }}
                    onTouchEnd={() => {
                        swipe_handlers.onTouchEnd();
                        pull_handlers.onTouchEnd();
                    }}
                >
                    <MobilePullIndicator
                        pull_distance={pull_distance}
                        is_ready={is_pull_ready}
                        is_refreshing={is_refreshing}
                    />

                    <MobileDailyTimeline />

                    {/* Timer Card (running section) */}
                    <MobileRunningSection
                        records={running_records}
                        active_record_id={active_record_id}
                        elapsed_seconds={elapsed_seconds}
                        onToggle={handleToggleRecord}
                        onEdit={handleEditRecord}
                        onComplete={(r) => markAsCompleted(r.id)}
                        onDelete={(r) => deleteRecord(r.id)}
                        animation_key={animation_key}
                    />

                    {/* Task List */}
                    <MobileRecordList
                        records={other_records}
                        active_record_id={active_record_id}
                        onToggle={handleToggleRecord}
                        onEdit={handleEditRecord}
                        onOpenCompleted={openCompletedModal}
                        onOpenTrash={openTrashModal}
                        onCopyRecords={openCopyModal}
                        onComplete={(r) => markAsCompleted(r.id)}
                        onDelete={(r) => deleteRecord(r.id)}
                        animation_key={animation_key}
                    />
                </div>
            </SlideIn>

            {/* FAB */}
            <FadeIn
                show={is_ready}
                delay={MOBILE_DAILY_DELAYS.content + 0.2}
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <MobileSpeedDialFab
                    on_add_record={() =>
                        window.dispatchEvent(
                            new Event("shortcut:openNewWorkModal")
                        )
                    }
                    on_open_preset={() => setIsPresetSheetOpen(true)}
                    on_long_press={handleFabLongPress}
                    app_theme={app_theme}
                />
            </FadeIn>

            <MobilePresetSheet
                open={is_preset_sheet_open}
                onClose={() => setIsPresetSheetOpen(false)}
                onAddRecord={handleAddRecordOnly}
                onStartRecord={handleStartRecordFromTemplate}
            />

            <MobileRecentWorkMenu
                open={recent_menu_open}
                anchor_rect={recent_menu_anchor}
                recent_works={recent_works}
                onSelect={handleRecentWorkSelect}
                onClose={() => setRecentMenuOpen(false)}
            />

            {/* Modals */}
            <RecordCopyModal
                open={is_copy_open}
                records={display_records}
                selected_date={selected_date}
                onClose={closeCopyModal}
            />

            <MobileRecordFormSheet
                open={is_add_open}
                record={null}
                onClose={closeAddModal}
            />

            <MobileRecordFormSheet
                open={is_edit_open}
                record={
                    editing_record_id
                        ? records.find((r) => r.id === editing_record_id) ||
                          null
                        : null
                }
                onClose={closeEditModal}
            />

            <MobileRecordListSheet
                open={is_completed_open}
                title={RECORD_MODAL_TITLE.COMPLETED}
                records={completed_records}
                empty_text={RECORD_EMPTY.NO_COMPLETED}
                onClose={closeCompletedModal}
                onRestore={(r) => markAsIncomplete(r.id)}
            />

            <MobileRecordListSheet
                open={is_trash_open}
                title={RECORD_MODAL_TITLE.TRASH}
                records={deleted_records}
                empty_text={RECORD_EMPTY.NO_TRASH}
                onClose={closeTrashModal}
                onRestore={(r) => restoreRecord(r.id)}
                onPermanentDelete={(r) => permanentlyDeleteRecord(r.id)}
            />
        </div>
    );
}

export default MobileDailyPage;
