/**
 * 타이머 표시 컴포넌트
 *
 * 초 단위 경과 시간을 타이머 형식으로 표시
 */

import { Typography } from "antd";
import { formatTimer, formatTimerWithSeconds } from "../lib/time";

const { Text } = Typography;

export interface TimerDisplayProps {
    /** 경과 시간 (초 단위) */
    seconds: number;
    /** 초 단위 포함 여부 */
    showSeconds?: boolean;
    /** 실행 중 표시 스타일 */
    isRunning?: boolean;
    /** 추가 스타일 */
    style?: React.CSSProperties;
}

/**
 * 타이머 표시 컴포넌트
 *
 * @example
 * <TimerDisplay seconds={3661} /> // "01:01"
 * <TimerDisplay seconds={3661} showSeconds /> // "01:01:01"
 */
export function TimerDisplay({
    seconds,
    showSeconds = false,
    isRunning = false,
    style,
}: TimerDisplayProps) {
    const display_text = showSeconds
        ? formatTimerWithSeconds(seconds)
        : formatTimer(seconds);

    return (
        <Text
            strong
            style={{
                fontFamily: "monospace",
                fontSize: "var(--font-size-md)",
                color: isRunning ? "var(--color-primary)" : undefined,
                ...style,
            }}
        >
            {display_text}
        </Text>
    );
}

export default TimerDisplay;
