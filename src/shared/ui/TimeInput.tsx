/**
 * 시간 입력 컴포넌트
 * 
 * 세션 시간 편집용 Input 컴포넌트
 * 로컬 상태를 사용하여 부모 리렌더링 문제 해결
 */

import { useState } from "react";
import { Input } from "antd";
import { isValidTimeFormat } from "../lib/time";

export interface TimeInputProps {
    /** 현재 시간 값 (HH:mm 형식) */
    value: string;
    /** 저장 콜백 (유효한 형식일 때만 호출) */
    onSave: (new_time: string) => void;
    /** Input 너비 (기본값: 70) */
    width?: number;
    /** placeholder (기본값: "HH:mm") */
    placeholder?: string;
    /** 비활성화 여부 */
    disabled?: boolean;
    /** 추가 스타일 */
    style?: React.CSSProperties;
}

/**
 * 시간 입력 컴포넌트
 * 
 * @example
 * <TimeInput
 *   value="09:30"
 *   onSave={(time) => handleSave(time)}
 * />
 */
export function TimeInput({
    value,
    onSave,
    width = 70,
    placeholder = "HH:mm",
    disabled = false,
    style,
}: TimeInputProps) {
    const [edit_value, setEditValue] = useState<string | null>(null);
    const is_editing = edit_value !== null;

    const handleFocus = () => {
        if (!disabled) {
            setEditValue(value);
        }
    };

    const handleBlur = () => {
        if (edit_value === null) return;

        // 시간 형식 검증 (HH:mm)
        if (isValidTimeFormat(edit_value) && edit_value !== value) {
            onSave(edit_value);
        }
        setEditValue(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
            setEditValue(null);
        }
    };

    return (
        <Input
            value={is_editing ? edit_value : value}
            onChange={(e) => setEditValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={disabled}
            style={{ 
                width, 
                fontFamily: "monospace",
                ...style,
            }}
            placeholder={placeholder}
        />
    );
}

export default TimeInput;
