/**
 * 간트 차트 관련 순수 함수 모음
 */

// 타입
export type {
    GroupedWork,
    DragSelection,
    TimeSlot,
    ResizeState,
    ConflictRange,
    TimeRange,
    GanttBarProps,
    GanttRowProps,
    TimeAxisProps,
    LunchOverlayProps,
    ResizeHandleProps,
} from "./types";

// 슬롯 계산
export {
    groupRecordsByDealName,
    collectOccupiedSlots,
    addRunningTimerSlot,
    calculateAvailableRange,
    isTimeOccupied,
    minutesToPixels,
    pixelsToMinutes,
} from "./slot_calculator";

// 드래그 핸들러
export {
    type DragResult,
    MIN_DRAG_DURATION,
    validateDragSelection,
    validateResizeResult,
    snapToGrid,
    calculateMinutesFromMouseEvent,
} from "./drag_handler";

// 바 계산
export {
    type BarStyle,
    type LunchOverlayStyle,
    type SelectionStyle,
    calculateTimeRange,
    generateTimeLabels,
    calculateBarStyle,
    calculateResizingBarStyle,
    calculateLunchOverlayStyle,
    calculateSelectionStyle,
    calculateConflictOverlayStyle,
    calculateWorkColor,
    xToMinutes,
    formatResizeTimeIndicator,
} from "./bar_calculator";

// 충돌 감지
export {
    type ConflictInfo,
    detectConflicts,
    isSessionConflicting,
    isTimeRangeOverlapping,
    calculateOverlapRange,
} from "./conflict_detector";
