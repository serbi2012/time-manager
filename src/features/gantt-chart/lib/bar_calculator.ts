/**
 * 간트 바 스타일 계산 관련 순수 함수
 */

import type {
    WorkSession,
    WorkRecord,
    WorkTemplate,
} from "../../../shared/types";
import { timeToMinutes, minutesToTime } from "../../../shared/lib/time";

/**
 * 시간 범위 계산 결과
 */
export interface TimeRange {
    start: number; // 시작 분 (예: 540 = 09:00)
    end: number; // 종료 분 (예: 1080 = 18:00)
}

/**
 * 바 스타일 결과
 */
export interface BarStyle {
    left: string;
    width: string;
    backgroundColor: string;
    opacity?: number;
    animation?: string;
    boxShadow?: string;
    borderRadius?: string;
    transition?: string;
}

/**
 * 점심시간 오버레이 스타일 결과
 */
export interface LunchOverlayStyle {
    left: string;
    width: string;
}

/**
 * 선택 영역 스타일 결과
 */
export interface SelectionStyle {
    left: string;
    width: string;
}

/**
 * 시간 범위 계산 (기본 9시-18시, 세션에 따라 확장)
 */
export function calculateTimeRange(
    grouped_works: { sessions: WorkSession[] }[],
    current_time_mins: number,
    active_session_id: string | null
): TimeRange {
    let min_start = 9 * 60; // 09:00
    let max_end = 18 * 60; // 18:00

    if (grouped_works.length > 0) {
        grouped_works.forEach((group) => {
            group.sessions.forEach((session) => {
                const start = timeToMinutes(session.start_time);
                // 진행 중인 세션은 현재 시간 사용
                const is_running = session.id === active_session_id;
                const end = is_running
                    ? current_time_mins
                    : timeToMinutes(session.end_time);
                min_start = Math.min(min_start, start);
                max_end = Math.max(max_end, end);
            });
        });
    }

    return {
        start: Math.floor(min_start / 60) * 60,
        end: Math.ceil(max_end / 60) * 60,
    };
}

/**
 * 시간 라벨 생성
 */
export function generateTimeLabels(time_range: TimeRange): string[] {
    const labels: string[] = [];
    for (let m = time_range.start; m <= time_range.end; m += 60) {
        labels.push(
            `${Math.floor(m / 60)
                .toString()
                .padStart(2, "0")}:00`
        );
    }
    return labels;
}

/**
 * 바 스타일 계산
 */
export function calculateBarStyle(
    session: WorkSession,
    color: string,
    time_range: TimeRange,
    current_time_mins: number,
    is_running: boolean = false
): BarStyle {
    const total_minutes = time_range.end - time_range.start;
    const start = timeToMinutes(session.start_time);
    // 진행 중인 세션은 현재 시간을 end로 사용
    const end = is_running
        ? current_time_mins
        : timeToMinutes(session.end_time);

    let left = ((start - time_range.start) / total_minutes) * 100;
    let width = ((end - start) / total_minutes) * 100;

    // 최소 너비 보장 (0분 세션도 표시)
    const min_width_percent = Math.max((5 / total_minutes) * 100, 1);
    width = Math.max(width, min_width_percent);

    // 범위 제한
    left = Math.max(0, Math.min(left, 100));
    const max_width = 100 - left;
    width = Math.min(width, max_width);

    const style: BarStyle = {
        left: `${left}%`,
        width: `${width}%`,
        backgroundColor: color,
        boxShadow: `0 1px 3px ${color}30`,
        borderRadius: "var(--radius-md)",
    };

    if (is_running) {
        style.opacity = 1;
        style.boxShadow = `0 2px 8px ${color}40`;
    }

    return style;
}

/**
 * 리사이즈 중인 바 스타일 계산
 */
export function calculateResizingBarStyle(
    handle: "left" | "right",
    original_start: number,
    original_end: number,
    current_value: number,
    color: string,
    time_range: TimeRange
): BarStyle | null {
    const total_minutes = time_range.end - time_range.start;
    const start = handle === "left" ? current_value : original_start;
    const end = handle === "right" ? current_value : original_end;

    // 유효하지 않은 범위면 null 반환
    if (end <= start) return null;

    const left = ((start - time_range.start) / total_minutes) * 100;
    const width = ((end - start) / total_minutes) * 100;

    return {
        left: `${left}%`,
        width: `${Math.max(width, 0.5)}%`,
        backgroundColor: color,
    };
}

/**
 * 점심시간 오버레이 스타일 계산
 */
export function calculateLunchOverlayStyle(
    lunch_start: number,
    lunch_end: number,
    time_range: TimeRange
): LunchOverlayStyle | null {
    const total_minutes = time_range.end - time_range.start;

    // 점심시간이 범위 밖이면 null
    if (lunch_end <= time_range.start || lunch_start >= time_range.end) {
        return null;
    }

    const visible_start = Math.max(lunch_start, time_range.start);
    const visible_end = Math.min(lunch_end, time_range.end);

    const left = ((visible_start - time_range.start) / total_minutes) * 100;
    const width = ((visible_end - visible_start) / total_minutes) * 100;

    return {
        left: `${left}%`,
        width: `${width}%`,
    };
}

/**
 * 선택 영역 스타일 계산
 */
export function calculateSelectionStyle(
    start_mins: number,
    end_mins: number,
    time_range: TimeRange
): SelectionStyle {
    const total_minutes = time_range.end - time_range.start;
    const left = ((start_mins - time_range.start) / total_minutes) * 100;
    const width = ((end_mins - start_mins) / total_minutes) * 100;

    return {
        left: `${left}%`,
        width: `${width}%`,
    };
}

/**
 * 충돌 영역 스타일 계산
 */
export function calculateConflictOverlayStyle(
    conflict_start: number,
    conflict_end: number,
    time_range: TimeRange
): SelectionStyle {
    const total_minutes = time_range.end - time_range.start;
    const left_percent =
        ((conflict_start - time_range.start) / total_minutes) * 100;
    const width_percent =
        ((conflict_end - conflict_start) / total_minutes) * 100;

    return {
        left: `${left_percent}%`,
        width: `${width_percent}%`,
    };
}

/**
 * 작업별 색상 계산
 */
export function calculateWorkColor(
    record: WorkRecord,
    templates: WorkTemplate[]
): string {
    // 템플릿에서 색상 찾기
    const template = templates.find(
        (t) =>
            t.work_name === record.work_name && t.deal_name === record.deal_name
    );
    if (template) return template.color;

    const colors = [
        "#3182F6",
        "#34C759",
        "#FF9500",
        "#F04452",
        "#6366F1",
        "#00B8D9",
        "#EC4899",
        "#F97316",
        "#84CC16",
        "#2563EB",
    ];
    let hash = 0;
    const key = record.work_name + record.deal_name;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * X 좌표를 분 단위로 변환
 */
export function xToMinutes(
    x: number,
    grid_rect: DOMRect,
    time_range: TimeRange
): number {
    const total_minutes = time_range.end - time_range.start;
    const relative_x = x - grid_rect.left;
    const percentage = relative_x / grid_rect.width;
    const mins = time_range.start + percentage * total_minutes;
    // 1분 단위로 스냅
    return Math.round(mins);
}

/**
 * 리사이즈 시간 표시 문자열 생성
 */
export function formatResizeTimeIndicator(
    handle: "left" | "right",
    original_start: number,
    original_end: number,
    current_value: number
): string {
    const start = handle === "left" ? current_value : original_start;
    const end = handle === "right" ? current_value : original_end;
    return `${minutesToTime(start)} ~ ${minutesToTime(end)}`;
}
