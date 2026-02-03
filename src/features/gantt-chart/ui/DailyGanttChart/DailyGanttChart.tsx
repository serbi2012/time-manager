/**
 * 일간 간트 차트 컴포넌트 (리팩토링됨)
 * - 메인 오케스트레이션 컴포넌트
 * - 훅과 하위 컴포넌트 조합
 */

import { useState, useCallback, useEffect } from "react";
import { Card, Typography, message } from "antd";
import dayjs from "dayjs";
import { useWorkStore } from "../../../../store/useWorkStore";
import { useResponsive } from "../../../../hooks/useResponsive";
import { minutesToTime } from "../../../../shared/lib/time";
import { getSessionMinutes } from "../../../../shared/lib/session";
import type { WorkRecord, WorkSession } from "../../../../shared/types";

// 훅
import { useGanttData } from "../../hooks/useGanttData";
import { useGanttDrag } from "../../hooks/useGanttDrag";
import { useGanttResize } from "../../hooks/useGanttResize";
import { useGanttTime } from "../../hooks/useGanttTime";

// lib 함수
import {
    calculateLunchOverlayStyle,
    calculateSelectionStyle,
} from "../../lib/bar_calculator";

// UI 컴포넌트
import { GanttAddModal } from "../GanttAddModal";
import { GanttEditModal } from "../GanttEditModal";
import { GanttStyles } from "../GanttStyles";
import { EmptyGanttChart } from "./EmptyGanttChart";
import { GanttChartContent } from "./GanttChartContent";

const { Text } = Typography;

/**
 * 일간 간트 차트 메인 컴포넌트
 */
export function DailyGanttChart() {
    const { is_mobile } = useResponsive();
    const { selected_date, timer, deleteSession } = useWorkStore();

    // 시간 관련 훅
    const { gantt_tick, lunch_time, calculateDurationExcludingLunch } =
        useGanttTime();

    // 데이터 훅
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

    // 드래그 훅
    const {
        is_dragging,
        drag_selection,
        grid_ref,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    } = useGanttDrag({ time_range, occupied_slots });

    // 리사이즈 훅
    const {
        resize_state,
        handleResizeStart,
        handleResizeMove,
        handleResizeEnd,
    } = useGanttResize({ time_range, selected_date });

    // 모달 상태
    const [is_add_modal_open, setIsAddModalOpen] = useState(false);
    const [selected_time_range, setSelectedTimeRange] = useState<{
        start: string;
        end: string;
    } | null>(null);

    // 수정 모달 상태
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [edit_record, setEditRecord] = useState<WorkRecord | null>(null);
    const [edit_session, setEditSession] = useState<WorkSession | null>(null);

    // 우클릭 팝오버 상태
    const [context_menu, setContextMenu] = useState<{
        session: WorkSession;
        record: WorkRecord;
    } | null>(null);

    // document 레벨 이벤트 리스너
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

    // 더블클릭으로 수정 모달 열기
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

    // 우클릭 메뉴에서 수정
    const handleContextEdit = useCallback(() => {
        if (!context_menu) return;
        setEditRecord(context_menu.record);
        setEditSession(context_menu.session);
        setIsEditModalOpen(true);
        setContextMenu(null);
    }, [context_menu]);

    // 우클릭 메뉴에서 세션 삭제
    const handleContextDeleteSession = useCallback(() => {
        if (!context_menu) return;
        const { session, record } = context_menu;
        if (session.id === timer.active_session_id) {
            message.info("진행 중인 세션은 삭제할 수 없습니다.");
            setContextMenu(null);
            return;
        }
        deleteSession(record.id, session.id);
        message.success("세션이 삭제되었습니다.");
        setContextMenu(null);
    }, [context_menu, deleteSession, timer.active_session_id]);

    // 총 소요 시간 계산
    const getTotalDuration = (sessions: WorkSession[]): number => {
        return sessions.reduce((sum, s) => sum + getSessionMinutes(s), 0);
    };

    // 선택 영역 스타일
    const getSelectionStyle = () => {
        if (!drag_selection) return {};
        return calculateSelectionStyle(
            drag_selection.start_mins,
            drag_selection.end_mins,
            time_range
        );
    };

    // 점심시간 오버레이 스타일
    const lunch_overlay_style = calculateLunchOverlayStyle(
        lunch_time.start,
        lunch_time.end,
        time_range
    );

    return (
        <>
            <Card
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            fontSize: 16,
                        }}
                    >
                        <span style={{ fontWeight: 800, fontSize: 17 }}>
                            일간 타임라인
                        </span>
                        <span style={{ color: "#d9d9d9" }}>|</span>
                        <span style={{ color: "#555", fontWeight: 500 }}>
                            {dayjs(selected_date).format("YYYY년 M월 D일")} (
                            {dayjs(selected_date).format("dd")})
                        </span>
                    </div>
                }
                size="small"
                extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        💡 빈 영역을 드래그하여 작업 추가
                    </Text>
                }
            >
                <div className={is_mobile ? "gantt-scroll-container" : ""}>
                    <div
                        className={`gantt-wrapper ${
                            is_mobile ? "gantt-mobile-scroll" : ""
                        }`}
                    >
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

            {/* 작업 추가 모달 */}
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

            {/* 작업 수정 모달 */}
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
