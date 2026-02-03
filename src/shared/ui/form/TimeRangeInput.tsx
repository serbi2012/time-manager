/**
 * 시작~종료 시간 입력 컴포넌트
 *
 * 두 개의 TimeInput을 조합하여 시간 범위를 입력받음
 *
 * @example
 * <TimeRangeInput
 *   startTime="09:00"
 *   endTime="18:00"
 *   onStartChange={(time) => setStartTime(time)}
 *   onEndChange={(time) => setEndTime(time)}
 * />
 */

import { Space, Typography } from "antd";
import { TimeInput } from "../TimeInput";

const { Text } = Typography;

export interface TimeRangeInputProps {
    /** 시작 시간 (HH:mm 형식) */
    startTime: string;
    /** 종료 시간 (HH:mm 형식) */
    endTime: string;
    /** 시작 시간 변경 콜백 */
    onStartChange: (time: string) => void;
    /** 종료 시간 변경 콜백 */
    onEndChange: (time: string) => void;
    /** 시작 시간 placeholder (기본값: "시작") */
    startPlaceholder?: string;
    /** 종료 시간 placeholder (기본값: "종료") */
    endPlaceholder?: string;
    /** Input 너비 (기본값: 70) */
    inputWidth?: number;
    /** 구분자 (기본값: "~") */
    separator?: string;
    /** 비활성화 여부 */
    disabled?: boolean;
    /** 컴팩트 모드 (간격 좁힘) */
    compact?: boolean;
}

/**
 * 시작~종료 시간 입력 컴포넌트
 */
export function TimeRangeInput({
    startTime,
    endTime,
    onStartChange,
    onEndChange,
    startPlaceholder = "시작",
    endPlaceholder = "종료",
    inputWidth = 70,
    separator = "~",
    disabled = false,
    compact = false,
}: TimeRangeInputProps) {
    return (
        <Space size={compact ? 4 : 8} align="center">
            <TimeInput
                value={startTime}
                onSave={onStartChange}
                width={inputWidth}
                placeholder={startPlaceholder}
                disabled={disabled}
            />
            <Text type="secondary">{separator}</Text>
            <TimeInput
                value={endTime}
                onSave={onEndChange}
                width={inputWidth}
                placeholder={endPlaceholder}
                disabled={disabled}
            />
        </Space>
    );
}

export default TimeRangeInput;
