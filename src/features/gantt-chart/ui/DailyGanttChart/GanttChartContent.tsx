/**
 * 간트 차트 콘텐츠 (작업 기록 있을 때)
 * - 시간 헤더, 그리드, 점심/충돌 오버레이, 선택 영역, 작업별 행(바)
 */

import { Tooltip, Typography } from "antd";
import { formatDuration, minutesToTime } from "../../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import {
    calculateBarStyle,
    calculateResizingBarStyle,
    calculateConflictOverlayStyle,
} from "../../lib/bar_calculator";
import { GanttBarCell } from "./GanttBarCell";
import { ConflictOverlayTooltip } from "./ConflictOverlayTooltip";
import {
    GANTT_LABEL_LUNCH,
    GANTT_LABEL_CONFLICT,
    GANTT_ROW_HEIGHT,
    GANTT_ROW_LABEL_MAX_WIDTH,
    GANTT_FONT_XSMALL,
} from "../../constants";

const { Text } = Typography;

export interface GanttChartContentProps {
    grouped_works: Array<{
        key: string;
        record: WorkRecord;
        sessions: WorkSession[];
    }>;
    time_labels: string[];
    time_range: { start: number; end: number };
    current_time_mins: number;
    lunch_overlay_style: { left: string; width: string } | null;
    conflict_info: {
        conflicting_sessions: Set<string>;
        conflict_ranges: Array<{ start: number; end: number }>;
    };
    resize_state: {
        session_id: string;
        handle: "left" | "right";
        original_start: number;
        original_end: number;
        current_value: number;
    } | null;
    context_menu: { session: WorkSession; record: WorkRecord } | null;
    timer: { active_session_id: string | null };
    grid_ref: React.RefObject<HTMLDivElement | null>;
    is_dragging: boolean;
    drag_selection: { start_mins: number; end_mins: number } | null;
    getSelectionStyle: () => { left?: string; width?: string };
    getWorkColor: (record: WorkRecord) => string;
    getTotalDuration: (sessions: WorkSession[]) => number;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleResizeStart: (
        e: React.MouseEvent,
        session: WorkSession,
        record: WorkRecord,
        handle: "left" | "right"
    ) => void;
    handleBarDoubleClick: (
        record: WorkRecord,
        session: WorkSession,
        e: React.MouseEvent
    ) => void;
    setContextMenu: (
        menu: { session: WorkSession; record: WorkRecord } | null
    ) => void;
    handleContextEdit: () => void;
    handleContextDeleteSession: () => void;
}

export function GanttChartContent({
    grouped_works,
    time_labels,
    time_range,
    current_time_mins,
    lunch_overlay_style,
    conflict_info,
    resize_state,
    context_menu,
    timer,
    grid_ref,
    is_dragging,
    drag_selection,
    getSelectionStyle,
    getWorkColor,
    getTotalDuration,
    handleMouseDown,
    handleResizeStart,
    handleBarDoubleClick,
    setContextMenu,
    handleContextEdit,
    handleContextDeleteSession,
}: GanttChartContentProps) {
    return (
        <div className="gantt-container">
            <div className="gantt-time-header">
                {time_labels.map((label, idx) => (
                    <div
                        key={label}
                        className="gantt-time-label"
                        style={{
                            left: `${(idx / (time_labels.length - 1)) * 100}%`,
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div
                className="gantt-grid"
                ref={grid_ref}
                onMouseDown={handleMouseDown}
            >
                {time_labels.map((label, idx) => (
                    <div
                        key={label}
                        className="gantt-grid-line"
                        style={{
                            left: `${(idx / (time_labels.length - 1)) * 100}%`,
                        }}
                    />
                ))}

                {lunch_overlay_style && (
                    <Tooltip title={GANTT_LABEL_LUNCH}>
                        <div
                            className="gantt-lunch-overlay"
                            style={lunch_overlay_style}
                        />
                    </Tooltip>
                )}

                {conflict_info.conflict_ranges.map((range, idx) => {
                    const style = calculateConflictOverlayStyle(
                        range.start,
                        range.end,
                        time_range
                    );
                    return (
                        <Tooltip
                            key={`conflict-${idx}`}
                            title={
                                <ConflictOverlayTooltip
                                    start_mins={range.start}
                                    end_mins={range.end}
                                />
                            }
                        >
                            <div
                                className="gantt-conflict-overlay"
                                style={style}
                            >
                                <span className="gantt-conflict-label">
                                    {GANTT_LABEL_CONFLICT}
                                </span>
                            </div>
                        </Tooltip>
                    );
                })}

                {is_dragging && drag_selection && (
                    <div
                        className="gantt-selection"
                        style={getSelectionStyle()}
                    >
                        <Text className="gantt-selection-text">
                            {minutesToTime(drag_selection.start_mins)} ~{" "}
                            {minutesToTime(drag_selection.end_mins)}
                        </Text>
                    </div>
                )}

                <div className="gantt-bars">
                    {grouped_works.map((group, row_idx) => {
                        const color = getWorkColor(group.record);
                        const total_duration_formatted = formatDuration(
                            getTotalDuration(group.sessions)
                        );
                        return (
                            <div
                                key={group.key}
                                className="gantt-row"
                                style={{
                                    top: row_idx * GANTT_ROW_HEIGHT,
                                }}
                            >
                                <div
                                    className="gantt-row-label"
                                    style={{ borderLeftColor: color }}
                                >
                                    <Text
                                        ellipsis
                                        style={{
                                            fontSize: GANTT_FONT_XSMALL,
                                            maxWidth: GANTT_ROW_LABEL_MAX_WIDTH,
                                        }}
                                    >
                                        {group.record.deal_name ||
                                            group.record.work_name}
                                    </Text>
                                </div>

                                <div className="gantt-row-bars">
                                    {group.sessions.map((session, idx) => {
                                        const is_context_open =
                                            context_menu?.session.id ===
                                            session.id;
                                        const is_running =
                                            session.id ===
                                            timer.active_session_id;
                                        const is_resizing =
                                            resize_state?.session_id ===
                                            session.id;
                                        const is_conflicting =
                                            conflict_info.conflicting_sessions.has(
                                                session.id
                                            );

                                        const bar_style = is_resizing
                                            ? calculateResizingBarStyle(
                                                  resize_state!.handle,
                                                  resize_state!.original_start,
                                                  resize_state!.original_end,
                                                  resize_state!.current_value,
                                                  color,
                                                  time_range
                                              )
                                            : calculateBarStyle(
                                                  session,
                                                  color,
                                                  time_range,
                                                  current_time_mins,
                                                  is_running
                                              );

                                        return (
                                            <GanttBarCell
                                                key={session.id + idx}
                                                record={group.record}
                                                session={session}
                                                bar_style={bar_style}
                                                is_running={is_running}
                                                is_resizing={is_resizing}
                                                is_conflicting={is_conflicting}
                                                is_context_open={
                                                    is_context_open
                                                }
                                                resize_state={resize_state}
                                                sessions_count={
                                                    group.sessions.length
                                                }
                                                total_duration_formatted={
                                                    total_duration_formatted
                                                }
                                                on_double_click={
                                                    handleBarDoubleClick
                                                }
                                                on_context_menu={(e) => {
                                                    e.preventDefault();
                                                    setContextMenu({
                                                        session,
                                                        record: group.record,
                                                    });
                                                }}
                                                on_edit={handleContextEdit}
                                                on_delete={
                                                    handleContextDeleteSession
                                                }
                                                on_context_open_change={(
                                                    open
                                                ) =>
                                                    !open &&
                                                    setContextMenu(null)
                                                }
                                                on_resize_start={
                                                    handleResizeStart
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
