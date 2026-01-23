/**
 * 간트 차트 관련 타입 정의
 */

import type { WorkRecord, WorkSession } from "../../../shared/types";

/**
 * 작업별 그룹화된 세션 정보
 */
export interface GroupedWork {
    key: string;
    record: WorkRecord;
    sessions: WorkSession[];
    first_start: number;
}

/**
 * 드래그 선택 영역
 */
export interface DragSelection {
    start_mins: number;
    end_mins: number;
}

/**
 * 시간 슬롯 (충돌 감지용)
 */
export interface TimeSlot {
    start: number;
    end: number;
}

/**
 * 리사이즈 드래그 상태
 */
export interface ResizeState {
    session_id: string;
    record_id: string;
    handle: "left" | "right";
    original_start: number;
    original_end: number;
    current_value: number;
}

/**
 * 충돌 정보
 */
export interface ConflictRange {
    start: number;
    end: number;
    session_ids: string[];
}

/**
 * 시간 범위 설정
 */
export interface TimeRange {
    start: number;  // 시작 분 (예: 540 = 09:00)
    end: number;    // 종료 분 (예: 1080 = 18:00)
}

/**
 * 간트 바 Props
 */
export interface GanttBarProps {
    session: WorkSession;
    record: WorkRecord;
    start_px: number;
    width_px: number;
    is_running: boolean;
    is_conflicting: boolean;
    color: string;
    on_resize_start: (
        e: React.MouseEvent,
        session: WorkSession,
        record: WorkRecord,
        handle: "left" | "right"
    ) => void;
    on_context_menu: (session: WorkSession, record: WorkRecord) => void;
    on_edit: (record: WorkRecord) => void;
}

/**
 * 간트 행 Props
 */
export interface GanttRowProps {
    group: GroupedWork;
    pixels_per_hour: number;
    start_hour: number;
    conflicting_sessions: Set<string>;
    active_session_id: string | null;
    resize_state: ResizeState | null;
    on_resize_start: GanttBarProps["on_resize_start"];
    on_context_menu: GanttBarProps["on_context_menu"];
    on_edit: GanttBarProps["on_edit"];
}

/**
 * 시간 축 Props
 */
export interface TimeAxisProps {
    start_hour: number;
    end_hour: number;
    pixels_per_hour: number;
}

/**
 * 점심시간 오버레이 Props
 */
export interface LunchOverlayProps {
    start_hour: number;
    pixels_per_hour: number;
}

/**
 * 리사이즈 핸들 Props
 */
export interface ResizeHandleProps {
    position: "left" | "right";
    on_mouse_down: (e: React.MouseEvent) => void;
}
