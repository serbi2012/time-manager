/**
 * Mobile daily gantt chart component
 * - Clean Swim Lane design with scroll container
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, message } from "antd";
import dayjs from "dayjs";
import { useWorkStore } from "../../../../store/useWorkStore";
import { minutesToTime } from "../../../../shared/lib/time";
import { getSessionMinutes } from "../../../../shared/lib/session";
import type { WorkRecord, WorkSession } from "../../../../shared/types";

import { useGanttData } from "../../hooks/useGanttData";
import { useGanttDrag } from "../../hooks/useGanttDrag";
import { useGanttResize } from "../../hooks/useGanttResize";
import { useGanttTime } from "../../hooks/useGanttTime";

import {
    calculateLunchOverlayStyle,
    calculateSelectionStyle,
} from "../../lib/bar_calculator";

import { GanttAddModal } from "../GanttAddModal";
import { GanttEditModal } from "../GanttEditModal";
import { GanttStyles } from "../GanttStyles";
import { EmptyGanttChart } from "./EmptyGanttChart";
import { GanttChartContent } from "./GanttChartContent";
import { GanttHeader } from "./GanttHeader";
import {
    GANTT_MESSAGE_ACTIVE_SESSION_CANNOT_DELETE,
    GANTT_MESSAGE_SESSION_DELETED,
} from "../../constants";

export function MobileDailyGanttChart() {
    const { selected_date, timer, deleteSession, setSelectedDate } =
        useWorkStore();

    const { gantt_tick, lunch_time, calculateDurationExcludingLunch } =
        useGanttTime();

    const {
        grouped_works,
        occupied_slots,
        conflict_info,
        time_range,
        time_labels,
        current_time_mins,
        today_records,
        getWorkColor,
    } = useGanttData(gantt_tick);

    const {
        is_dragging,
        drag_selection,
        grid_ref,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    } = useGanttDrag({ time_range, occupied_slots });

    const {
        resize_state,
        handleResizeStart,
        handleResizeMove,
        handleResizeEnd,
    } = useGanttResize({ time_range, selected_date });

    const [is_add_modal_open, setIsAddModalOpen] = useState(false);
    const [selected_time_range, setSelectedTimeRange] = useState<{
        start: string;
        end: string;
    } | null>(null);

    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [edit_record, setEditRecord] = useState<WorkRecord | null>(null);
    const [edit_session, setEditSession] = useState<WorkSession | null>(null);

    const [context_menu, setContextMenu] = useState<{
        session: WorkSession;
        record: WorkRecord;
    } | null>(null);

    useEffect(() => {
        if (!is_dragging && !resize_state) return;

        const handleDocumentMouseMove = (e: MouseEvent) => {
            if (resize_state && grid_ref.current) {
                handleResizeMove(
                    e.clientX,
                    grid_ref.current.getBoundingClientRect()
                );
            } else if (is_dragging) {
                handleMouseMove(e.clientX);
            }
        };

        const handleDocumentMouseUp = () => {
            if (resize_state) {
                handleResizeEnd();
            } else if (is_dragging) {
                const result = handleMouseUp();
                if (result && result.end_mins - result.start_mins >= 1) {
                    setSelectedTimeRange({
                        start: minutesToTime(result.start_mins),
                        end: minutesToTime(result.end_mins),
                    });
                    setIsAddModalOpen(true);
                }
            }
        };

        document.addEventListener("mousemove", handleDocumentMouseMove);
        document.addEventListener("mouseup", handleDocumentMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleDocumentMouseMove);
            document.removeEventListener("mouseup", handleDocumentMouseUp);
        };
    }, [
        is_dragging,
        resize_state,
        handleMouseMove,
        handleMouseUp,
        handleResizeMove,
        handleResizeEnd,
        grid_ref,
    ]);

    const handleBarDoubleClick = useCallback(
        (record: WorkRecord, session: WorkSession, e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            setEditRecord(record);
            setEditSession(session);
            setIsEditModalOpen(true);
        },
        []
    );

    const handleContextEdit = useCallback(() => {
        if (!context_menu) return;
        setEditRecord(context_menu.record);
        setEditSession(context_menu.session);
        setIsEditModalOpen(true);
        setContextMenu(null);
    }, [context_menu]);

    const handleContextDeleteSession = useCallback(() => {
        if (!context_menu) return;
        const { session, record } = context_menu;
        if (session.id === timer.active_session_id) {
            message.info(GANTT_MESSAGE_ACTIVE_SESSION_CANNOT_DELETE);
            setContextMenu(null);
            return;
        }
        deleteSession(record.id, session.id);
        message.success(GANTT_MESSAGE_SESSION_DELETED);
        setContextMenu(null);
    }, [context_menu, deleteSession, timer.active_session_id]);

    const getTotalDuration = (sessions: WorkSession[]): number => {
        return sessions.reduce((sum, s) => sum + getSessionMinutes(s), 0);
    };

    const total_work_minutes = useMemo(() => {
        return grouped_works.reduce(
            (sum, g) =>
                sum +
                g.sessions.reduce((s, sess) => s + getSessionMinutes(sess), 0),
            0
        );
    }, [grouped_works]);

    const getSelectionStyle = () => {
        if (!drag_selection) return {};
        return calculateSelectionStyle(
            drag_selection.start_mins,
            drag_selection.end_mins,
            time_range
        );
    };

    const lunch_overlay_style = calculateLunchOverlayStyle(
        lunch_time.start,
        lunch_time.end,
        time_range
    );

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

    return (
        <>
            <Card styles={{ body: { padding: 0 } }}>
                <GanttHeader
                    selected_date={selected_date}
                    total_minutes={total_work_minutes}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                />
                <div className="gantt-scroll-container">
                    <div className="gantt-wrapper gantt-mobile-scroll px-xl pt-lg pb-xl">
                        {grouped_works.length === 0 ? (
                            <EmptyGanttChart
                                grid_ref={grid_ref}
                                time_labels={time_labels}
                                lunch_overlay_style={lunch_overlay_style}
                                is_dragging={is_dragging}
                                drag_selection={drag_selection}
                                getSelectionStyle={getSelectionStyle}
                                handleMouseDown={handleMouseDown}
                            />
                        ) : (
                            <GanttChartContent
                                grouped_works={grouped_works}
                                time_labels={time_labels}
                                time_range={time_range}
                                current_time_mins={current_time_mins}
                                lunch_overlay_style={lunch_overlay_style}
                                conflict_info={conflict_info}
                                resize_state={resize_state}
                                context_menu={context_menu}
                                timer={timer}
                                grid_ref={grid_ref}
                                is_dragging={is_dragging}
                                drag_selection={drag_selection}
                                getSelectionStyle={getSelectionStyle}
                                getWorkColor={getWorkColor}
                                getTotalDuration={getTotalDuration}
                                handleMouseDown={handleMouseDown}
                                handleResizeStart={handleResizeStart}
                                handleBarDoubleClick={handleBarDoubleClick}
                                setContextMenu={setContextMenu}
                                handleContextEdit={handleContextEdit}
                                handleContextDeleteSession={
                                    handleContextDeleteSession
                                }
                            />
                        )}
                    </div>
                </div>

                <GanttStyles grouped_works_count={grouped_works.length} />
            </Card>

            <GanttAddModal
                open={is_add_modal_open}
                selected_time_range={selected_time_range}
                today_records={today_records}
                calculateDurationExcludingLunch={
                    calculateDurationExcludingLunch
                }
                onClose={() => {
                    setIsAddModalOpen(false);
                    setSelectedTimeRange(null);
                }}
            />

            <GanttEditModal
                open={is_edit_modal_open}
                record={edit_record}
                session={edit_session}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditRecord(null);
                    setEditSession(null);
                }}
            />
        </>
    );
}
