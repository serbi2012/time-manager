/**
 * 간트 차트 드래그 상태 관리 훅
 */

import { useState, useRef, useCallback } from "react";
import type { DragSelection, TimeSlot } from "../lib/slot_calculator";
import {
    calculateAvailableRange,
    isTimeOccupied,
} from "../lib/slot_calculator";
import { xToMinutes, type TimeRange } from "../lib/bar_calculator";

/**
 * 드래그 시작 참조 정보
 */
interface DragStartRef {
    mins: number;
    available_min: number;
    available_max: number;
    waiting_for_empty: boolean;
}

/**
 * 드래그 상태
 */
export interface DragState {
    is_dragging: boolean;
    selection: DragSelection | null;
}

export interface UseGanttDragReturn {
    /** 드래그 중 여부 */
    is_dragging: boolean;
    /** 드래그 선택 영역 */
    drag_selection: DragSelection | null;
    /** 그리드 ref */
    grid_ref: React.RefObject<HTMLDivElement | null>;
    /** 드래그 시작 핸들러 */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** 드래그 이동 핸들러 */
    handleMouseMove: (clientX: number) => void;
    /** 드래그 종료 핸들러 */
    handleMouseUp: () => DragSelection | null;
    /** 드래그 상태 리셋 */
    resetDrag: () => void;
}

interface UseGanttDragOptions {
    time_range: TimeRange;
    occupied_slots: TimeSlot[];
}

/**
 * 간트 차트 드래그 상태 관리 훅
 */
export function useGanttDrag(options: UseGanttDragOptions): UseGanttDragReturn {
    const { time_range, occupied_slots } = options;

    const [is_dragging, setIsDragging] = useState(false);
    const [drag_selection, setDragSelection] = useState<DragSelection | null>(
        null
    );
    const drag_start_ref = useRef<DragStartRef | null>(null);
    const grid_ref = useRef<HTMLDivElement>(null);

    // 특정 시간이 기존 세션 위에 있는지 확인
    const isOnExistingBar = useCallback(
        (mins: number): boolean => {
            return isTimeOccupied(mins, occupied_slots);
        },
        [occupied_slots]
    );

    // 확장 가능한 범위 계산
    const getAvailableRange = useCallback(
        (anchor_mins: number): { min: number; max: number } => {
            return calculateAvailableRange(anchor_mins, occupied_slots);
        },
        [occupied_slots]
    );

    // X 좌표를 분 단위로 변환
    const convertXToMinutes = useCallback(
        (x: number): number => {
            if (!grid_ref.current) return 0;
            const rect = grid_ref.current.getBoundingClientRect();
            return xToMinutes(x, rect, time_range);
        },
        [time_range]
    );

    // 드래그 시작
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (!grid_ref.current) return;

            // 기존 바 클릭은 무시
            const target = e.target as HTMLElement;
            if (target.classList.contains("gantt-bar")) {
                return;
            }

            const mins = convertXToMinutes(e.clientX);
            e.preventDefault();

            const on_existing = isOnExistingBar(mins);

            drag_start_ref.current = {
                mins,
                available_min: time_range.start,
                available_max: time_range.end,
                waiting_for_empty: on_existing,
            };
            setIsDragging(true);

            // 빈 영역에서 시작했으면 바로 선택 영역 표시
            if (!on_existing) {
                const available = getAvailableRange(mins);
                drag_start_ref.current.available_min = available.min;
                drag_start_ref.current.available_max = available.max;
                setDragSelection({
                    start_mins: mins,
                    end_mins: mins,
                });
            } else {
                setDragSelection(null);
            }
        },
        [convertXToMinutes, isOnExistingBar, getAvailableRange, time_range]
    );

    // 드래그 이동
    const handleMouseMove = useCallback(
        (clientX: number) => {
            if (!is_dragging || !drag_start_ref.current) return;

            const current_mins = convertXToMinutes(clientX);
            const on_existing = isOnExistingBar(current_mins);

            // 빈 영역 대기 중이면서 아직 기존 세션 위에 있으면 무시
            if (drag_start_ref.current.waiting_for_empty) {
                if (on_existing) {
                    setDragSelection(null);
                    return;
                } else {
                    // 빈 영역에 도달
                    const available = getAvailableRange(current_mins);
                    drag_start_ref.current = {
                        mins: current_mins,
                        available_min: available.min,
                        available_max: available.max,
                        waiting_for_empty: false,
                    };
                    setDragSelection({
                        start_mins: current_mins,
                        end_mins: current_mins,
                    });
                    return;
                }
            }

            const {
                mins: anchor_mins,
                available_min,
                available_max,
            } = drag_start_ref.current;

            // 확장 가능한 범위 내로 clamp
            const clamped_mins = Math.max(
                available_min,
                Math.min(available_max, current_mins)
            );

            setDragSelection({
                start_mins: Math.min(anchor_mins, clamped_mins),
                end_mins: Math.max(anchor_mins, clamped_mins),
            });
        },
        [is_dragging, convertXToMinutes, isOnExistingBar, getAvailableRange]
    );

    // 드래그 종료
    const handleMouseUp = useCallback((): DragSelection | null => {
        if (!is_dragging || !drag_selection) {
            setIsDragging(false);
            setDragSelection(null);
            drag_start_ref.current = null;
            return null;
        }

        const duration = drag_selection.end_mins - drag_selection.start_mins;
        const result = duration >= 1 ? { ...drag_selection } : null;

        setIsDragging(false);
        setDragSelection(null);
        drag_start_ref.current = null;

        return result;
    }, [is_dragging, drag_selection]);

    // 드래그 상태 리셋
    const resetDrag = useCallback(() => {
        setIsDragging(false);
        setDragSelection(null);
        drag_start_ref.current = null;
    }, []);

    return {
        is_dragging,
        drag_selection,
        grid_ref,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        resetDrag,
    };
}
