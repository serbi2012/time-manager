/**
 * 빈 간트 차트 (작업 기록 없을 때)
 * - 시간 헤더, 그리드, 점심 오버레이, 드래그 선택, 빈 상태 힌트
 */

import { Empty, Tooltip, Typography } from "antd";
import { minutesToTime } from "../../../../shared/lib/time";
import {
    GANTT_LABEL_LUNCH,
    GANTT_EMPTY_NO_RECORDS,
    GANTT_EMPTY_HINT_DRAG,
    GANTT_FONT_SMALL,
} from "../../constants";

const { Text } = Typography;

export interface EmptyGanttChartProps {
    grid_ref: React.RefObject<HTMLDivElement | null>;
    time_labels: string[];
    lunch_overlay_style: { left: string; width: string } | null;
    is_dragging: boolean;
    drag_selection: { start_mins: number; end_mins: number } | null;
    getSelectionStyle: () => { left?: string; width?: string };
    handleMouseDown: (e: React.MouseEvent) => void;
}

export function EmptyGanttChart({
    grid_ref,
    time_labels,
    lunch_overlay_style,
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
                    <Tooltip title={GANTT_LABEL_LUNCH}>
                        <div
                            className="gantt-lunch-overlay"
                            style={lunch_overlay_style}
                        />
                    </Tooltip>
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
                            <Text
                                type="secondary"
                                style={{ fontSize: GANTT_FONT_SMALL }}
                            >
                                {GANTT_EMPTY_HINT_DRAG}
                            </Text>
                        </span>
                    }
                />
            </div>
        </div>
    );
}
