/**
 * Mobile Daily Header — Sticky top area
 * Simple header + calendar strip + timeline bar + collapsible work list
 */

import { useState, useCallback, useMemo } from "react";
import { SettingOutlined, DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useWorkStore } from "../../store/useWorkStore";
import { useAuthHandlers } from "../../shared/hooks";
import { useSyncStatus } from "../../features/sync";
import { UserMenu } from "../../widgets/Header";
import { MobileDateNavBar } from "../../features/work-record/ui/Mobile/MobileDateNavBar";
import { MobileCalendarStrip } from "../../features/work-record/ui/Mobile/MobileCalendarStrip";
import { MobileGanttSegmentBar } from "../../features/gantt-chart/ui/DailyGanttChart/MobileGanttSegmentBar";
import { MobileGanttWorkCard } from "../../features/gantt-chart/ui/DailyGanttChart/MobileGanttWorkCard";
import { GanttEditModal } from "../../features/gantt-chart/ui/GanttEditModal";
import { useGanttData } from "../../features/gantt-chart/hooks/useGanttData";
import { useGanttTime } from "../../features/gantt-chart/hooks/useGanttTime";
import { GANTT_MOBILE_SECTION_WORK_LIST } from "../../features/gantt-chart/constants";
import type { WorkRecord, WorkSession } from "../../shared/types";

const HEADER_DATE_FORMAT = "YYYY년 M월 D일 dddd";
const HEADER_TITLE = "일간 기록";

export function MobileDailyHeader() {
    const {
        selected_date,
        setSelectedDate,
        records,
        timer,
        mobile_gantt_list_expanded,
        setMobileGanttListExpanded,
    } = useWorkStore();

    const {
        user,
        loading: auth_loading,
        isAuthenticated,
        handleLogin,
        handleLogout,
    } = useAuthHandlers();

    const { is_syncing, handleManualSync } = useSyncStatus({
        user,
        is_authenticated: isAuthenticated,
    });

    const { gantt_tick, lunch_time } = useGanttTime();
    const { grouped_works, time_range, current_time_mins, getWorkColor } =
        useGanttData(gantt_tick);

    const [active_work_id, setActiveWorkId] = useState<string | null>(null);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [edit_record, setEditRecord] = useState<WorkRecord | null>(null);
    const [edit_session, setEditSession] = useState<WorkSession | null>(null);

    const formatted_date = useMemo(
        () => dayjs(selected_date).format(HEADER_DATE_FORMAT),
        [selected_date]
    );

    const handleDateSelect = useCallback(
        (date_str: string) => {
            setSelectedDate(date_str);
        },
        [setSelectedDate]
    );

    const handleOpenSettings = useCallback(() => {
        window.dispatchEvent(new Event("openSettings"));
    }, []);

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

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditRecord(null);
        setEditSession(null);
    }, []);

    const has_works = grouped_works.length > 0;

    return (
        <>
            <div className="bg-bg-light">
                {/* Header */}
                <div className="px-xl pt-xl pb-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400">
                                {formatted_date}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mt-[2px]">
                                {HEADER_TITLE}
                            </div>
                        </div>
                        <div className="flex items-center gap-md">
                            <button
                                className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border-0 cursor-pointer"
                                onClick={handleOpenSettings}
                            >
                                <SettingOutlined style={{ fontSize: 18 }} />
                            </button>
                            <UserMenu
                                user={user}
                                auth_loading={auth_loading}
                                is_authenticated={isAuthenticated}
                                is_mobile={true}
                                is_syncing={is_syncing}
                                on_login={handleLogin}
                                on_logout={handleLogout}
                                on_manual_sync={handleManualSync}
                            />
                        </div>
                    </div>
                </div>

                <div className="mx-xl border-b border-gray-100" />

                {/* Date Navigation Bar */}
                <MobileDateNavBar
                    selected_date={selected_date}
                    onDateChange={handleDateSelect}
                />

                {/* Calendar Strip */}
                <MobileCalendarStrip
                    selected_date={selected_date}
                    onDateSelect={handleDateSelect}
                    records={records}
                />

                {/* Timeline Bar */}
                {has_works && (
                    <div className="pt-md pb-sm">
                        <MobileGanttSegmentBar
                            grouped_works={grouped_works}
                            time_range={time_range}
                            current_time_mins={current_time_mins}
                            lunch_time={lunch_time}
                            active_work_id={active_work_id}
                            getWorkColor={getWorkColor}
                            onSegmentTap={handleSegmentTap}
                        />
                    </div>
                )}

                {/* Collapsible Work List */}
                {has_works && (
                    <div className="px-lg pb-md">
                        <button
                            className="w-full flex items-center justify-between py-[6px] px-sm border-0 bg-transparent cursor-pointer"
                            onClick={() =>
                                setMobileGanttListExpanded(
                                    !mobile_gantt_list_expanded
                                )
                            }
                        >
                            <span className="text-sm text-gray-500 font-medium">
                                {GANTT_MOBILE_SECTION_WORK_LIST}
                            </span>
                            <DownOutlined
                                className="text-gray-400 transition-transform duration-200"
                                style={{
                                    fontSize: 11,
                                    transform: mobile_gantt_list_expanded
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                }}
                            />
                        </button>

                        <div
                            className="space-y-[6px] transition-all duration-200 overflow-hidden"
                            style={{
                                maxHeight: mobile_gantt_list_expanded
                                    ? `${grouped_works.length * 120}px`
                                    : "0px",
                                marginTop: mobile_gantt_list_expanded
                                    ? "4px"
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
                    </div>
                )}
            </div>

            <GanttEditModal
                open={is_edit_modal_open}
                record={edit_record}
                session={edit_session}
                onClose={handleCloseEditModal}
            />
        </>
    );
}
