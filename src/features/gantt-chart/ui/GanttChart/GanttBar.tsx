/**
 * 간트 바 컴포넌트
 */

import { Tooltip } from "antd";
import { ClockCircleOutlined, EditOutlined } from "@ant-design/icons";
import type { GanttBarProps } from "../../lib/types";
import { ResizeHandle } from "../ResizeHandle";
import { formatDuration } from "../../../../shared/lib/time";
import { getSessionMinutes } from "../../../../shared/lib/session";

const CLOCK_ICON_STYLE: React.CSSProperties = {
    color: "#8B95A1",
    fontSize: 13,
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

/**
 * 간트 바 컴포넌트
 * 개별 세션을 시각적으로 표시
 */
export function GanttBar({
    session,
    record,
    start_px,
    width_px,
    is_running,
    is_conflicting,
    color,
    on_resize_start,
    on_context_menu,
    on_edit,
}: GanttBarProps) {
    const duration_mins = getSessionMinutes(session);
    const tooltip_content = (
        <div style={{ width: 260 }}>
            <div className="px-lg pt-lg pb-md">
                <div className="text-md font-semibold text-gray-900 leading-snug">
                    {record.deal_name || record.work_name}
                </div>
                {record.deal_name && (
                    <div className="text-sm text-gray-500 mt-xs leading-snug">
                        {record.work_name}
                    </div>
                )}
            </div>
            <div className="mx-lg h-px bg-gray-100" />
            <div className="px-lg py-md flex items-center gap-sm">
                <ClockCircleOutlined style={CLOCK_ICON_STYLE} />
                <span className="text-sm text-gray-700">
                    {session.start_time} - {session.end_time || "진행 중"}
                </span>
                <span className="text-sm font-semibold text-primary ml-auto">
                    {formatDuration(duration_mins)}
                </span>
            </div>
            {is_running && (
                <div className="px-lg pb-md">
                    <span className="text-xs font-medium text-success">
                        타이머 진행 중
                    </span>
                </div>
            )}
        </div>
    );

    const bar_style: React.CSSProperties = {
        left: start_px,
        width: Math.max(width_px, 4),
        background: is_running
            ? `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`
            : color,
        boxShadow: is_conflicting
            ? "0 0 0 2px var(--color-error)"
            : is_running
            ? `0 0 0 2px ${color}`
            : "0 1px 3px rgba(0,0,0,0.15)",
    };

    return (
        <Tooltip
            title={tooltip_content}
            placement="top"
            arrow={false}
            overlayStyle={TOOLTIP_OVERLAY_STYLE}
            overlayInnerStyle={TOOLTIP_INNER_STYLE}
        >
            <div
                className={`gantt-bar ${is_running ? "gantt-bar-running" : ""}`}
                style={bar_style}
                onContextMenu={(e) => {
                    e.preventDefault();
                    on_context_menu(session, record);
                }}
            >
                {/* 왼쪽 리사이즈 핸들 */}
                <ResizeHandle
                    position="left"
                    on_mouse_down={(e) =>
                        on_resize_start(e, session, record, "left")
                    }
                />

                {/* 바 내용 */}
                {width_px > 60 && (
                    <div className="gantt-bar-content">
                        <span className="gantt-bar-label">
                            {record.deal_name || record.work_name}
                        </span>
                    </div>
                )}

                {/* 오른쪽 리사이즈 핸들 (진행 중이 아닐 때만) */}
                {!is_running && (
                    <ResizeHandle
                        position="right"
                        on_mouse_down={(e) =>
                            on_resize_start(e, session, record, "right")
                        }
                    />
                )}

                {/* 수정 버튼 */}
                {width_px > 40 && (
                    <div
                        className="gantt-bar-edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            on_edit(record);
                        }}
                    >
                        <EditOutlined />
                    </div>
                )}

                <style>{`
                    .gantt-bar {
                        position: absolute;
                        height: 28px;
                        border-radius: var(--radius-xs);
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        transition: box-shadow 0.15s, transform 0.1s;
                        z-index: 2;
                    }
                    .gantt-bar:hover {
                        transform: translateY(-1px);
                        z-index: 5;
                    }
                    .gantt-bar-running {
                        animation: pulse 2s ease-in-out infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.85; }
                    }
                    .gantt-bar-content {
                        flex: 1;
                        min-width: 0;
                        padding: 0 24px 0 12px;
                        overflow: hidden;
                    }
                    .gantt-bar-label {
                        color: white;
                        font-size: var(--font-size-sm);
                        font-weight: var(--font-weight-medium);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                    }
                    .gantt-bar-edit {
                        position: absolute;
                        right: 4px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: white;
                        opacity: 0;
                        transition: opacity 0.15s;
                        padding: 2px;
                    }
                    .gantt-bar:hover .gantt-bar-edit {
                        opacity: 0.8;
                    }
                    .gantt-bar-edit:hover {
                        opacity: 1 !important;
                    }
                `}</style>
            </div>
        </Tooltip>
    );
}

export default GanttBar;
