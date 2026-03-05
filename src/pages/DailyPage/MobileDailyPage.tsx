/**
 * Mobile daily page — redesigned layout
 * Sticky header + scrollable content (timer card + task list)
 */

import { useState, useCallback, useMemo } from "react";
import { message } from "antd";

import { useWorkStore } from "../../store/useWorkStore";
import { useRecordCreation } from "../../shared/hooks";
import type { WorkRecord } from "../../shared/types";

import {
    useRecordData,
    useRecordTimer,
    useRecordActions,
    useRecordModals,
} from "../../features/work-record/hooks";

import {
    RecordAddModal,
    RecordEditModal,
} from "../../features/work-record/ui/RecordModals";
import {
    CompletedModal,
    TrashModal,
} from "../../features/work-record/ui/CompletedRecords";
import { MobileRunningSection } from "../../features/work-record/ui/Mobile/MobileRunningSection";
import { MobileRecordList } from "../../features/work-record/ui/Mobile/MobileRecordList";
import { MobileSpeedDialFab } from "../../features/work-record/ui/Mobile/MobileSpeedDialFab";
import { MobileRecentWorkMenu } from "../../features/work-record/ui/Mobile/MobileRecentWorkMenu";
import { MobilePresetDrawer } from "../../widgets/Navigation";

import {
    RECORD_SUCCESS,
    RECORD_WARNING,
    MARKDOWN_COPY,
    RECORD_UI_TEXT,
    CHAR_CODE_THRESHOLD,
    HANGUL_CHAR_WIDTH,
    ASCII_CHAR_WIDTH,
} from "../../features/work-record/constants";
import { getRecordDurationForDate } from "../../features/work-record/lib/duration_calculator";

import {
    SlideIn,
    FadeIn,
    usePageTransitionContext,
    MOBILE_DAILY_DELAYS,
} from "../../shared/ui";

import { MobileDailyHeader } from "./MobileDailyHeader";

/**
 * Mobile daily page — redesigned layout
 */
export function MobileDailyPage() {
    const [is_preset_drawer_open, setIsPresetDrawerOpen] = useState(false);
    const app_theme = useWorkStore((state) => state.app_theme);
    const records = useWorkStore((state) => state.records);
    const selected_date = useWorkStore((state) => state.selected_date);
    const getLunchTimeMinutes = useWorkStore((state) => state.getLunchTimeMinutes);
    const { createFromTemplate } = useRecordCreation();

    const handleAddRecordOnly = (template_id: string) => {
        createFromTemplate(template_id);
        setIsPresetDrawerOpen(false);
    };

    const { is_ready, transition_enabled, transition_speed } =
        usePageTransitionContext();

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
        editing_record_id,
        closeAddModal,
        openEditModal,
        closeEditModal,
        openCompletedModal,
        closeCompletedModal,
        openTrashModal,
        closeTrashModal,
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

    const handleCopyToClipboard = useCallback(() => {
        const lunch_time = getLunchTimeMinutes();
        const filtered = display_records.filter((r) => !r.is_deleted);
        if (filtered.length === 0) {
            message.warning(RECORD_WARNING.NO_RECORDS_TO_COPY);
            return;
        }

        const sorted = [...filtered].sort((a, b) =>
            (a.work_name || "").localeCompare(b.work_name || "", "ko")
        );

        const columns = MARKDOWN_COPY.COLUMNS;
        const data = sorted.map((r) => {
            const duration = getRecordDurationForDate(r, selected_date, lunch_time);
            return [
                r.work_name,
                r.deal_name || r.work_name,
                `${duration}${RECORD_UI_TEXT.MINUTE_UNIT}`,
                r.category_name || "",
                r.note || "",
            ];
        });

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
    }, [display_records, selected_date, getLunchTimeMinutes]);

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
                    <MobileDailyHeader />
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
                    onCopyRecords={handleCopyToClipboard}
                    onComplete={(r) => markAsCompleted(r.id)}
                    onDelete={(r) => deleteRecord(r.id)}
                    animation_key={animation_key}
                />
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
                    on_open_preset={() => setIsPresetDrawerOpen(true)}
                    on_long_press={handleFabLongPress}
                    app_theme={app_theme}
                />
            </FadeIn>

            <MobilePresetDrawer
                is_open={is_preset_drawer_open}
                on_close={() => setIsPresetDrawerOpen(false)}
                on_add_record_only={handleAddRecordOnly}
                app_theme={app_theme}
            />

            <MobileRecentWorkMenu
                open={recent_menu_open}
                anchor_rect={recent_menu_anchor}
                recent_works={recent_works}
                onSelect={handleRecentWorkSelect}
                onClose={() => setRecentMenuOpen(false)}
            />

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
        </div>
    );
}

export default MobileDailyPage;
