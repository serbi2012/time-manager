/**
 * 소요 시간 표시 컴포넌트
 * 
 * 분 단위 시간을 읽기 쉬운 형식으로 표시
 */

import { Typography } from "antd";
import { formatDuration, formatDurationAsTime } from "../lib/time";

const { Text } = Typography;

export interface DurationDisplayProps {
    /** 소요 시간 (분 단위) */
    minutes: number;
    /** 표시 형식 */
    format?: "readable" | "time";
    /** 텍스트 타입 */
    type?: "secondary" | "success" | "warning" | "danger";
    /** 강조 여부 */
    strong?: boolean;
    /** 추가 스타일 */
    style?: React.CSSProperties;
}

/**
 * 소요 시간 표시 컴포넌트
 * 
 * @example
 * <DurationDisplay minutes={90} /> // "1시간 30분"
 * <DurationDisplay minutes={90} format="time" /> // "01:30"
 */
export function DurationDisplay({
    minutes,
    format = "readable",
    type,
    strong = false,
    style,
}: DurationDisplayProps) {
    const display_text = format === "time" 
        ? formatDurationAsTime(minutes)
        : formatDuration(minutes);
    
    return (
        <Text type={type} strong={strong} style={style}>
            {display_text}
        </Text>
    );
}

export default DurationDisplay;
