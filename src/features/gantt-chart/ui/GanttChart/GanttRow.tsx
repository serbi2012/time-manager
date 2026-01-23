/**
 * 간트 행 컴포넌트
 */

import { Typography } from "antd";
import type { GanttRowProps } from "../../lib/types";
import { GanttBar } from "./GanttBar";
import { timeToMinutes } from "../../../../shared/lib/time";
import { TEMPLATE_COLORS } from "../../../../shared/config";

const { Text } = Typography;

/**
 * 간트 행 컴포넌트
 * 하나의 작업(deal_name)에 속한 세션들을 한 행에 표시
 */
export function GanttRow({
    group,
    pixels_per_hour,
    start_hour,
    conflicting_sessions,
    active_session_id,
    resize_state,
    on_resize_start,
    on_context_menu,
    on_edit,
}: GanttRowProps) {
    const { record, sessions, key } = group;
    
    // 색상 결정 (템플릿 색상 또는 기본 색상)
    const color = record.project_code
        ? TEMPLATE_COLORS[
              Math.abs(hashCode(record.project_code)) % TEMPLATE_COLORS.length
          ]
        : TEMPLATE_COLORS[0];

    return (
        <div className="gantt-row">
            {/* 작업명 라벨 */}
            <div className="gantt-row-label">
                <Text
                    ellipsis={{ tooltip: key }}
                    style={{ fontSize: 12 }}
                >
                    {key}
                </Text>
            </div>

            {/* 세션 바들 */}
            <div className="gantt-row-bars">
                {sessions.map((session) => {
                    const start_mins = timeToMinutes(session.start_time);
                    const end_mins = timeToMinutes(session.end_time);
                    
                    // 리사이즈 중이면 현재 값 사용
                    let display_start = start_mins;
                    let display_end = end_mins;
                    
                    if (resize_state && resize_state.session_id === session.id) {
                        if (resize_state.handle === "left") {
                            display_start = resize_state.current_value;
                        } else {
                            display_end = resize_state.current_value;
                        }
                    }
                    
                    const start_px =
                        ((display_start - start_hour * 60) / 60) * pixels_per_hour;
                    const width_px =
                        ((display_end - display_start) / 60) * pixels_per_hour;
                    
                    const is_running = session.id === active_session_id;
                    const is_conflicting = conflicting_sessions.has(session.id);

                    return (
                        <GanttBar
                            key={session.id}
                            session={session}
                            record={record}
                            start_px={start_px}
                            width_px={width_px}
                            is_running={is_running}
                            is_conflicting={is_conflicting}
                            color={color}
                            on_resize_start={on_resize_start}
                            on_context_menu={on_context_menu}
                            on_edit={on_edit}
                        />
                    );
                })}
            </div>

            <style>{`
                .gantt-row {
                    display: flex;
                    align-items: center;
                    height: 36px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .gantt-row-label {
                    width: 120px;
                    min-width: 120px;
                    padding: 0 8px;
                    overflow: hidden;
                }
                .gantt-row-bars {
                    flex: 1;
                    position: relative;
                    height: 100%;
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
}

/**
 * 문자열 해시 코드 생성
 */
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash;
}

export default GanttRow;
