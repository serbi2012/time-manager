/**
 * Gantt chart content (Clean Swim Lane layout)
 * - Time header, grid, lunch/conflict overlays, selection, row bars
 * - Current time indicator, row dividers, entry animations
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
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { LunchZoneOverlay } from "./LunchZoneOverlay";
import { GANTT_LABEL_CONFLICT } from "../../constants";

const GANTT_ROW_HEIGHT = 44;

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
    const total_range = time_range.end - time_range.start;
    const current_time_pct = `${
        ((current_time_mins - time_range.start) / total_range) * 100
    }%`;

    return (
        <div className="gantt-container">
            {/* Time header */}
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

            {/* Grid area */}
            <div
                className="gantt-grid"
                ref={grid_ref}
                onMouseDown={handleMouseDown}
            >
                {/* Vertical grid lines */}
                {time_labels.map((label, idx) => (
                    <div
                        key={label}
                        className="gantt-grid-line"
                        style={{
                            left: `${(idx / (time_labels.length - 1)) * 100}%`,
                        }}
                    />
                ))}

                {/* Lunch zone overlay */}
                {lunch_overlay_style && (
                    <LunchZoneOverlay style={lunch_overlay_style} />
                )}

                {/* Conflict overlays */}
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

                {/* Current time indicator */}
                <CurrentTimeIndicator left_pct={current_time_pct} />

                {/* Drag selection */}
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

                {/* Bars area */}
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
                                    animation: `fadeSlideUp 0.3s ease-out ${
                                        row_idx * 0.05
                                    }s both`,
                                }}
                            >
                                {/* Row label (J: slide from left, staggered) */}
                                <div
                                    className="gantt-row-label gantt-label-enter"
                                    style={{
                                        animationDelay: `${row_idx * 0.05}s`,
                                    }}
                                >
                                    <div className="text-right min-w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-800 truncate">
                                            {group.record.deal_name ||
                                                group.record.work_name}
                                        </div>
                                        {group.record.deal_name && (
                                            <div className="text-xs text-gray-400 truncate">
                                                {group.record.work_name}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="w-[3px] h-5 rounded-full flex-shrink-0"
                                        style={{ background: color }}
                                    />
                                </div>

                                {/* Session bars */}
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

                                {/* Row divider */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-50" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
