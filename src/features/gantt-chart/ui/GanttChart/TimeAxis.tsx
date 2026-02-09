/**
 * 간트 차트 시간 축 컴포넌트
 */

import { Typography } from "antd";
import type { TimeAxisProps } from "../../lib/types";

const { Text } = Typography;

/**
 * 시간 축 컴포넌트
 * 시간 라벨과 눈금을 표시
 */
export function TimeAxis({
    start_hour,
    end_hour,
    pixels_per_hour,
}: TimeAxisProps) {
    const hours: number[] = [];
    for (let h = start_hour; h <= end_hour; h++) {
        hours.push(h);
    }

    return (
        <div className="gantt-time-axis">
            {hours.map((h) => (
                <div
                    key={h}
                    className="gantt-hour-label"
                    style={{
                        left: (h - start_hour) * pixels_per_hour,
                        width: pixels_per_hour,
                    }}
                >
                    <Text type="secondary" className="!text-xs">
                        {h}:00
                    </Text>
                </div>
            ))}
            <style>{`
                .gantt-time-axis {
                    position: relative;
                    height: 24px;
                    border-bottom: 1px solid var(--color-border-default);
                }
                .gantt-hour-label {
                    position: absolute;
                    text-align: left;
                    padding-left: var(--spacing-xs);
                    border-left: 1px solid var(--color-border-default);
                    height: 100%;
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
}

export default TimeAxis;
