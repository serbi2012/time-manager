/**
 * Mobile daily gantt chart - Segment Bar + Card List design
 * - Top: segment bar (all sessions as colored blocks on a timeline)
 * - Bottom: grouped work cards with session chips
 */

import { useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { useWorkStore } from "../../../../store/useWorkStore";
import { getSessionMinutes } from "../../../../shared/lib/session";
import type { WorkRecord, WorkSession } from "../../../../shared/types";

import { useGanttData } from "../../hooks/useGanttData";
import { useGanttTime } from "../../hooks/useGanttTime";

import { GanttAddModal } from "../GanttAddModal";
import { GanttEditModal } from "../GanttEditModal";
import { MobileGanttHeader } from "./MobileGanttHeader";
import { MobileGanttSegmentBar } from "./MobileGanttSegmentBar";
import { MobileGanttWorkCard } from "./MobileGanttWorkCard";
import { MobileGanttEmptyState } from "./MobileGanttEmptyState";
import { DownOutlined } from "@ant-design/icons";
import { GANTT_MOBILE_SECTION_WORK_LIST } from "../../constants";

export function MobileDailyGanttChart() {
    const {
        selected_date,
        timer,
        setSelectedDate,
        mobile_gantt_list_expanded,
        setMobileGanttListExpanded,
    } = useWorkStore();

    const { gantt_tick, lunch_time, calculateDurationExcludingLunch } =
        useGanttTime();

    const {
        grouped_works,
        time_range,
        current_time_mins,
        today_records,
        getWorkColor,
    } = useGanttData(gantt_tick);

    const [active_work_id, setActiveWorkId] = useState<string | null>(null);

    const [is_add_modal_open, setIsAddModalOpen] = useState(false);
    const [selected_time_range, setSelectedTimeRange] = useState<{
        start: string;
        end: string;
    } | null>(null);

    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [edit_record, setEditRecord] = useState<WorkRecord | null>(null);
    const [edit_session, setEditSession] = useState<WorkSession | null>(null);

    const total_work_minutes = useMemo(() => {
        return grouped_works.reduce(
            (sum, g) =>
                sum +
                g.sessions.reduce((s, sess) => s + getSessionMinutes(sess), 0),
            0
        );
    }, [grouped_works]);

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

    const handleSegmentTap = useCallback((work_key: string) => {
        setActiveWorkId((prev) => (prev === work_key ? null : work_key));
    }, []);

    const handleCardTap = useCallback((work_key: string) => {
        setActiveWorkId((prev) => (prev === work_key ? null : work_key));
    }, []);

    const handleEditSession = useCallback(
        (record: WorkRecord, session: WorkSession) => {
            setEditRecord(record);
            setEditSession(session);
            setIsEditModalOpen(true);
        },
        []
    );

    const handleCloseAddModal = useCallback(() => {
        setIsAddModalOpen(false);
        setSelectedTimeRange(null);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditRecord(null);
        setEditSession(null);
    }, []);

    const has_works = grouped_works.length > 0;

    return (
        <>
            <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
                <MobileGanttHeader
                    selected_date={selected_date}
                    total_minutes={total_work_minutes}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                />

                {!has_works ? (
                    <MobileGanttEmptyState />
                ) : (
                    <>
                        <MobileGanttSegmentBar
                            grouped_works={grouped_works}
                            time_range={time_range}
                            current_time_mins={current_time_mins}
                            lunch_time={lunch_time}
                            active_work_id={active_work_id}
                            getWorkColor={getWorkColor}
                            onSegmentTap={handleSegmentTap}
                        />

                        {/* Work card list - collapsible */}
                        <button
                            className="flex items-center justify-between w-full px-5 pt-md pb-sm bg-transparent border-0 cursor-pointer"
                            onClick={() =>
                                setMobileGanttListExpanded(
                                    !mobile_gantt_list_expanded
                                )
                            }
                        >
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                {GANTT_MOBILE_SECTION_WORK_LIST}
                            </span>
                            <DownOutlined
                                className="text-gray-400 transition-transform duration-200"
                                style={{
                                    fontSize: 10,
                                    transform: mobile_gantt_list_expanded
                                        ? "rotate(0deg)"
                                        : "rotate(-90deg)",
                                }}
                            />
                        </button>
                        <div
                            className="px-5 pb-5 flex flex-col gap-sm transition-all duration-200 overflow-hidden"
                            style={{
                                maxHeight: mobile_gantt_list_expanded
                                    ? `${grouped_works.length * 120}px`
                                    : "0px",
                                paddingBottom: mobile_gantt_list_expanded
                                    ? undefined
                                    : "0px",
                                opacity: mobile_gantt_list_expanded ? 1 : 0,
                            }}
                        >
                            {grouped_works.map((group) => {
                                const color = getWorkColor(group.record);
                                const is_running = group.sessions.some(
                                    (s) => s.id === timer.active_session_id
                                );
                                return (
                                    <MobileGanttWorkCard
                                        key={group.key}
                                        group={group}
                                        color={color}
                                        is_active={active_work_id === group.key}
                                        is_running={is_running}
                                        onTap={handleCardTap}
                                        onEdit={handleEditSession}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <GanttAddModal
                open={is_add_modal_open}
                selected_time_range={selected_time_range}
                today_records={today_records}
                calculateDurationExcludingLunch={
                    calculateDurationExcludingLunch
                }
                onClose={handleCloseAddModal}
            />

            <GanttEditModal
                open={is_edit_modal_open}
                record={edit_record}
                session={edit_session}
                onClose={handleCloseEditModal}
            />
        </>
    );
}
