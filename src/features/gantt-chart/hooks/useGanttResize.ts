/**
 * 간트 차트 리사이즈 상태 관리 훅
 */

import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { useWorkStore } from "../../../store/useWorkStore";
import {
    GANTT_MESSAGE_MIN_1_MINUTE,
    GANTT_MESSAGE_ACTIVE_SESSION_END_CANNOT_EDIT,
} from "../constants";
import { timeToMinutes, minutesToTime } from "../../../shared/lib/time";
import type { WorkSession, WorkRecord } from "../../../shared/types";
import type { ResizeState, TimeRange } from "../lib/types";
import { xToMinutes } from "../lib/bar_calculator";

export interface UseGanttResizeReturn {
    /** 리사이즈 상태 */
    resize_state: ResizeState | null;
    /** 리사이즈 시작 핸들러 */
    handleResizeStart: (
        e: React.MouseEvent,
        session: WorkSession,
        record: WorkRecord,
        handle: "left" | "right"
    ) => void;
    /** 리사이즈 이동 핸들러 */
    handleResizeMove: (clientX: number, grid_rect: DOMRect) => void;
    /** 리사이즈 종료 핸들러 */
    handleResizeEnd: () => void;
}

interface UseGanttResizeOptions {
    time_range: TimeRange;
    selected_date: string;
}

/**
 * 간트 차트 리사이즈 상태 관리 훅
 */
export function useGanttResize(
    options: UseGanttResizeOptions
): UseGanttResizeReturn {
    const { time_range, selected_date } = options;

    const { timer, updateSession, updateTimerStartTime } = useWorkStore();
    const [resize_state, setResizeState] = useState<ResizeState | null>(null);

    // 리사이즈 시작
    const handleResizeStart = useCallback(
        (
            e: React.MouseEvent,
            session: WorkSession,
            record: WorkRecord,
            handle: "left" | "right"
        ) => {
            e.stopPropagation();
            e.preventDefault();

            const start_mins = timeToMinutes(session.start_time);
            const end_mins = timeToMinutes(session.end_time);

            setResizeState({
                session_id: session.id,
                record_id: record.id,
                handle,
                original_start: start_mins,
                original_end: end_mins,
                current_value: handle === "left" ? start_mins : end_mins,
            });
        },
        []
    );

    // 리사이즈 이동
    const handleResizeMove = useCallback(
        (clientX: number, grid_rect: DOMRect) => {
            if (!resize_state) return;

            const mins = xToMinutes(clientX, grid_rect, time_range);
            const clamped = Math.max(
                time_range.start,
                Math.min(time_range.end, mins)
            );

            setResizeState((prev) =>
                prev ? { ...prev, current_value: clamped } : null
            );
        },
        [resize_state, time_range]
    );

    // 리사이즈 종료
    const handleResizeEnd = useCallback(() => {
        if (!resize_state) return;

        const {
            session_id,
            record_id,
            handle,
            original_start,
            original_end,
            current_value,
        } = resize_state;

        const new_start = handle === "left" ? current_value : original_start;
        const new_end = handle === "right" ? current_value : original_end;

        // 유효성 검사 (최소 1분 이상)
        if (new_end - new_start < 1) {
            message.warning(GANTT_MESSAGE_MIN_1_MINUTE);
            setResizeState(null);
            return;
        }

        // 진행 중인 작업의 시작 시간 조절
        if (session_id === timer.active_session_id && handle === "left") {
            const today = dayjs(selected_date);
            const new_start_timestamp = today
                .hour(Math.floor(new_start / 60))
                .minute(new_start % 60)
                .second(0)
                .millisecond(0)
                .valueOf();

            const result = updateTimerStartTime(new_start_timestamp);
            if (result.adjusted) {
                message.info(result.message);
            } else if (!result.success) {
                message.error(result.message);
            }
            setResizeState(null);
            return;
        }

        // 진행 중인 세션의 오른쪽 핸들은 조절 불가
        if (session_id === timer.active_session_id && handle === "right") {
            message.info(GANTT_MESSAGE_ACTIVE_SESSION_END_CANNOT_EDIT);
            setResizeState(null);
            return;
        }

        // updateSession 호출
        const result = updateSession(
            record_id,
            session_id,
            minutesToTime(new_start),
            minutesToTime(new_end)
        );

        if (result.adjusted) {
            message.info(result.message);
        } else if (!result.success) {
            message.error(result.message);
        }

        setResizeState(null);
    }, [
        resize_state,
        updateSession,
        selected_date,
        updateTimerStartTime,
        timer.active_session_id,
    ]);

    return {
        resize_state,
        handleResizeStart,
        handleResizeMove,
        handleResizeEnd,
    };
}
