/**
 * Empty gantt chart (no work records)
 * - Time header, grid, lunch overlay, drag selection, empty state hint
 */

import { Empty, Typography } from "antd";
import { minutesToTime } from "../../../../shared/lib/time";
import { LunchZoneOverlay } from "./LunchZoneOverlay";
import { GANTT_EMPTY_NO_RECORDS, GANTT_EMPTY_HINT_DRAG } from "../../constants";

const { Text } = Typography;

export interface EmptyGanttChartProps {
    grid_ref: React.RefObject<HTMLDivElement | null>;
    time_labels: string[];
    lunch_overlay_style: { left: string; width: string } | null;
    lunch_time: { start: number; end: number };
    is_dragging: boolean;
    drag_selection: { start_mins: number; end_mins: number } | null;
    getSelectionStyle: () => { left?: string; width?: string };
    handleMouseDown: (e: React.MouseEvent) => void;
}

export function EmptyGanttChart({
    grid_ref,
    time_labels,
    lunch_overlay_style,
    lunch_time,
    is_dragging,
    drag_selection,
    getSelectionStyle,
    handleMouseDown,
}: EmptyGanttChartProps) {
    return (
        <div
            className="gantt-empty-container"
            ref={grid_ref}
            onMouseDown={handleMouseDown}
        >
            <div className="gantt-time-header-empty">
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

            <div className="gantt-grid-empty">
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
                    <LunchZoneOverlay
                        style={lunch_overlay_style}
                        lunch_start_mins={lunch_time.start}
                        lunch_end_mins={lunch_time.end}
                    />
                )}
            </div>

            {is_dragging && drag_selection && (
                <div className="gantt-selection" style={getSelectionStyle()}>
                    <Text className="gantt-selection-text">
                        {minutesToTime(drag_selection.start_mins)} ~{" "}
                        {minutesToTime(drag_selection.end_mins)}
                    </Text>
                </div>
            )}

            <div className="gantt-empty-hint">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span>
                            {GANTT_EMPTY_NO_RECORDS}
                            <br />
                            <Text type="secondary" className="!text-sm">
                                {GANTT_EMPTY_HINT_DRAG}
                            </Text>
                        </span>
                    }
                />
            </div>
        </div>
    );
}
