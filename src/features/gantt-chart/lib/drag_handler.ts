/**
 * 간트 차트 드래그 관련 순수 함수
 */

import type { TimeSlot, DragSelection } from "./slot_calculator";

/**
 * 드래그 결과 타입
 */
export interface DragResult {
    is_valid: boolean;
    start_mins: number;
    end_mins: number;
    message?: string;
}

/**
 * 최소 드래그 시간 (분)
 */
export const MIN_DRAG_DURATION = 5;

/**
 * 드래그 선택 영역 검증 및 조정
 */
export function validateDragSelection(
    selection: DragSelection,
    available_min: number,
    available_max: number
): DragResult {
    let start = Math.min(selection.start_mins, selection.end_mins);
    let end = Math.max(selection.start_mins, selection.end_mins);
    
    // 가용 범위로 클램핑
    start = Math.max(start, available_min);
    end = Math.min(end, available_max);
    
    // 최소 시간 검증
    if (end - start < MIN_DRAG_DURATION) {
        return {
            is_valid: false,
            start_mins: start,
            end_mins: end,
            message: `최소 ${MIN_DRAG_DURATION}분 이상 선택해야 합니다.`,
        };
    }
    
    return {
        is_valid: true,
        start_mins: start,
        end_mins: end,
    };
}

/**
 * 리사이즈 결과 검증
 */
export function validateResizeResult(
    new_start: number,
    new_end: number,
    occupied_slots: TimeSlot[],
    _current_session_id: string
): DragResult {
    // 시간 순서 검증
    if (new_end <= new_start) {
        return {
            is_valid: false,
            start_mins: new_start,
            end_mins: new_end,
            message: "종료 시간이 시작 시간보다 이전입니다.",
        };
    }
    
    // 최소 시간 검증
    if (new_end - new_start < MIN_DRAG_DURATION) {
        return {
            is_valid: false,
            start_mins: new_start,
            end_mins: new_end,
            message: `최소 ${MIN_DRAG_DURATION}분 이상이어야 합니다.`,
        };
    }
    
    // 충돌 검사 (자기 자신 제외)
    for (const slot of occupied_slots) {
        // 점심시간 슬롯은 session_id가 없으므로 항상 검사
        const overlaps = !(new_end <= slot.start || new_start >= slot.end);
        if (overlaps) {
            return {
                is_valid: false,
                start_mins: new_start,
                end_mins: new_end,
                message: "다른 세션과 시간이 겹칩니다.",
            };
        }
    }
    
    return {
        is_valid: true,
        start_mins: new_start,
        end_mins: new_end,
    };
}

/**
 * 스냅 그리드에 맞춰 시간 조정 (5분 단위)
 */
export function snapToGrid(minutes: number, grid_size: number = 5): number {
    return Math.round(minutes / grid_size) * grid_size;
}

/**
 * 마우스 이벤트에서 분 단위 시간 계산
 */
export function calculateMinutesFromMouseEvent(
    client_x: number,
    container_rect: DOMRect,
    start_hour: number,
    pixels_per_hour: number
): number {
    const relative_x = client_x - container_rect.left;
    const minutes = Math.round(relative_x * (60 / pixels_per_hour)) + start_hour * 60;
    return snapToGrid(minutes);
}
