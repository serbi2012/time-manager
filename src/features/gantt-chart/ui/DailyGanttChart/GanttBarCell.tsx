/**
 * Gantt bar cell (Popover + Tooltip + bar div + resize handles)
 * - One bar per session with colored shadow, shimmer for running
 */

import { Popover, Tooltip } from "antd";
import { minutesToTime } from "../../../../shared/lib/time";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import { SessionContextMenu } from "./SessionContextMenu";
import { SessionBarTooltip } from "./SessionBarTooltip";
import type { BarStyle } from "../../lib/bar_calculator";

export interface ResizeStateDisplay {
    session_id: string;
    handle: "left" | "right";
    original_start: number;
    original_end: number;
    current_value: number;
}

export interface GanttBarCellProps {
    record: WorkRecord;
    session: WorkSession;
    bar_style: BarStyle | null;
    is_running: boolean;
    is_resizing: boolean;
    is_conflicting: boolean;
    is_context_open: boolean;
    resize_state: ResizeStateDisplay | null;
    sessions_count: number;
    total_duration_formatted: string;
    on_double_click: (
        record: WorkRecord,
        session: WorkSession,
        e: React.MouseEvent
    ) => void;
    on_context_menu: (e: React.MouseEvent) => void;
    on_edit: () => void;
    on_delete: () => void;
    on_context_open_change: (open: boolean) => void;
    on_resize_start: (
        e: React.MouseEvent,
        session: WorkSession,
        record: WorkRecord,
        handle: "left" | "right"
    ) => void;
}

const BAR_CLASS_NAMES = {
    base: "gantt-bar",
    running: "gantt-bar-running",
    resizing: "gantt-bar-resizing",
    conflict: "gantt-bar-conflict",
};

const TOOLTIP_OVERLAY_STYLE: React.CSSProperties = { maxWidth: "none" };

const TOOLTIP_INNER_STYLE: React.CSSProperties = {
    padding: 0,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    border: "1px solid #F2F4F6",
    overflow: "hidden",
};

export function GanttBarCell({
    record,
    session,
    bar_style,
    is_running,
    is_resizing,
    is_conflicting,
    is_context_open,
    resize_state,
    sessions_count,
    total_duration_formatted,
    on_double_click,
    on_context_menu,
    on_edit,
    on_delete,
    on_context_open_change,
    on_resize_start,
}: GanttBarCellProps) {
    const bar_class = [
        BAR_CLASS_NAMES.base,
        is_running && BAR_CLASS_NAMES.running,
        is_resizing && BAR_CLASS_NAMES.resizing,
        is_conflicting && BAR_CLASS_NAMES.conflict,
    ]
        .filter(Boolean)
        .join(" ");

    const tooltip_content =
        is_resizing || is_context_open ? null : (
            <SessionBarTooltip
                record={record}
                session={session}
                sessions_count={sessions_count}
                total_duration_formatted={total_duration_formatted}
                is_conflicting={is_conflicting}
            />
        );

    const context_menu_content = (
        <SessionContextMenu
            record={record}
            session={session}
            is_running={is_running}
            on_edit={on_edit}
            on_delete={on_delete}
        />
    );

    const resize_time_indicator =
        is_resizing && resize_state ? (
            <div className="resize-time-indicator">
                {minutesToTime(
                    resize_state.handle === "left"
                        ? resize_state.current_value
                        : resize_state.original_start
                )}{" "}
                ~{" "}
                {minutesToTime(
                    resize_state.handle === "right"
                        ? resize_state.current_value
                        : resize_state.original_end
                )}
            </div>
        ) : null;

    return (
        <Popover
            key={session.id}
            open={is_context_open}
            onOpenChange={(open) => !open && on_context_open_change(false)}
            trigger="contextMenu"
            placement="top"
            content={context_menu_content}
        >
            <Tooltip
                title={tooltip_content}
                placement="top"
                arrow={false}
                overlayStyle={TOOLTIP_OVERLAY_STYLE}
                overlayInnerStyle={TOOLTIP_INNER_STYLE}
            >
                <div
                    className={bar_class}
                    style={bar_style || {}}
                    onDoubleClick={(e) => on_double_click(record, session, e)}
                    onContextMenu={on_context_menu}
                >
                    <div
                        className="resize-handle resize-handle-left"
                        onMouseDown={(e) =>
                            on_resize_start(e, session, record, "left")
                        }
                    />
                    {!is_running && (
                        <div
                            className="resize-handle resize-handle-right"
                            onMouseDown={(e) =>
                                on_resize_start(e, session, record, "right")
                            }
                        />
                    )}
                    {/* Shimmer effect for running sessions */}
                    {is_running && <div className="gantt-bar-shimmer" />}
                    {resize_time_indicator}
                </div>
            </Tooltip>
        </Popover>
    );
}
