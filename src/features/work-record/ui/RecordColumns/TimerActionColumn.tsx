/**
 * 타이머 액션 컬럼 (시작/정지 버튼)
 */

import { Button, Tooltip } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";

interface TimerActionColumnProps {
    record: WorkRecord;
    is_active: boolean;
    is_timer_running: boolean;
    onToggle: (record: WorkRecord) => void;
}

export function TimerActionColumn({
    record,
    is_active,
    is_timer_running,
    onToggle,
}: TimerActionColumnProps) {
    const tooltip_title = is_active
        ? "정지"
        : is_timer_running
        ? "전환"
        : "시작";

    return (
        <Tooltip title={tooltip_title}>
            <Button
                type={is_active ? "primary" : "default"}
                danger={is_active}
                shape="circle"
                size="small"
                icon={
                    is_active ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                }
                onClick={() => onToggle(record)}
            />
        </Tooltip>
    );
}
