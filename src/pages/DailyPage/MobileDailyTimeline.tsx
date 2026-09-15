/**
 * 모바일 타임라인 섹션
 * 고정 영역이 아니라 본문에 놓이며, 접었다 펼 수 있다 (기본 접힘)
 */

import { useState, useCallback } from "react";
import { DownOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";

import { useWorkStore } from "../../store/useWorkStore";
import { MobileActionMenu } from "../../shared/ui";
import { MobileGanttSegmentBar } from "../../features/gantt-chart/ui/DailyGanttChart/MobileGanttSegmentBar";
import { MobileGanttWorkCard } from "../../features/gantt-chart/ui/DailyGanttChart/MobileGanttWorkCard";
import { GanttEditModal } from "../../features/gantt-chart/ui/GanttEditModal";
import { useGanttData } from "../../features/gantt-chart/hooks/useGanttData";
import { useGanttTime } from "../../features/gantt-chart/hooks/useGanttTime";
import { useMobileGanttMenus } from "../../features/gantt-chart/hooks/useMobileGanttMenus";
import {
    GANTT_MOBILE_SECTION_TIMELINE,
    GANTT_MOBILE_SECTION_WORK_LIST,
} from "../../features/gantt-chart/constants";
import type { WorkRecord, WorkSession } from "../../shared/types";

const COLLAPSE_DURATION = 0.2;

export function MobileDailyTimeline() {
    const { timer, mobile_gantt_list_expanded, setMobileGanttListExpanded } =
        useWorkStore(
            useShallow((s) => ({
                timer: s.timer,
                mobile_gantt_list_expanded: s.mobile_gantt_list_expanded,
                setMobileGanttListExpanded: s.setMobileGanttListExpanded,
            }))
        );

    const { gantt_tick, lunch_time } = useGanttTime();
    const { grouped_works, time_range, current_time_mins, getWorkColor } =
        useGanttData(gantt_tick);

    const [active_work_id, setActiveWorkId] = useState<string | null>(null);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [edit_record, setEditRecord] = useState<WorkRecord | null>(null);
    const [edit_session, setEditSession] = useState<WorkSession | null>(null);

    const handleToggle = useCallback(() => {
        setMobileGanttListExpanded(!mobile_gantt_list_expanded);
    }, [mobile_gantt_list_expanded, setMobileGanttListExpanded]);

    const handleTap = useCallback((work_key: string) => {
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

    const { card_menu, seg_menu, handleCardLongPress, handleSegmentLongPress } =
        useMobileGanttMenus({
            grouped_works,
            onEditSession: handleEditSession,
        });

    if (grouped_works.length === 0) return null;

    return (
        <>
            <div className="mx-xl mb-md rounded-xl bg-bg-default shadow-xs overflow-hidden">
                <button
                    className="w-full flex items-center justify-between px-lg py-md border-0 bg-transparent cursor-pointer"
                    onClick={handleToggle}
                >
                    <span className="text-sm font-medium text-text-secondary">
                        {GANTT_MOBILE_SECTION_TIMELINE}
                    </span>
                    <DownOutlined
                        className="text-text-disabled transition-transform duration-200"
                        style={{
                            fontSize: 11,
                            transform: mobile_gantt_list_expanded
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                        }}
                    />
                </button>

                <MobileGanttSegmentBar
                    grouped_works={grouped_works}
                    time_range={time_range}
                    current_time_mins={current_time_mins}
                    lunch_time={lunch_time}
                    active_work_id={active_work_id}
                    getWorkColor={getWorkColor}
                    onSegmentTap={handleTap}
                    onSegmentLongPress={handleSegmentLongPress}
                />

                <AnimatePresence initial={false}>
                    {mobile_gantt_list_expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: COLLAPSE_DURATION }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-5 flex flex-col gap-sm">
                                <span className="text-xs font-medium text-text-disabled">
                                    {GANTT_MOBILE_SECTION_WORK_LIST}
                                </span>
                                {grouped_works.map((group) => {
                                    const is_running = group.sessions.some(
                                        (s) => s.id === timer.active_session_id
                                    );
                                    return (
                                        <MobileGanttWorkCard
                                            key={group.key}
                                            group={group}
                                            color={getWorkColor(group.record)}
                                            is_active={
                                                active_work_id === group.key
                                            }
                                            is_running={is_running}
                                            onTap={handleTap}
                                            onEdit={handleEditSession}
                                            onLongPress={handleCardLongPress}
                                        />
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <GanttEditModal
                open={is_edit_modal_open}
                record={edit_record}
                session={edit_session}
                onClose={handleCloseEditModal}
            />

            <MobileActionMenu
                open={card_menu.open}
                anchor_rect={card_menu.anchor}
                items={card_menu.items}
                onAction={card_menu.onAction}
                onClose={card_menu.onClose}
            />

            <MobileActionMenu
                open={seg_menu.open}
                anchor_rect={seg_menu.anchor}
                items={seg_menu.items}
                onAction={seg_menu.onAction}
                onClose={seg_menu.onClose}
            />
        </>
    );
}
