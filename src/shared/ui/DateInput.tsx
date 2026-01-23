/**
 * 날짜 입력 컴포넌트
 * 
 * 세션 날짜 편집용 Input 컴포넌트
 * 로컬 상태를 사용하여 부모 리렌더링 문제 해결
 */

import { useState } from "react";
import { Input } from "antd";
import { isValidDateFormat } from "../lib/time";

export interface DateInputProps {
    /** 현재 날짜 값 (YYYY-MM-DD 형식) */
    value: string;
    /** 저장 콜백 (유효한 형식일 때만 호출) */
    onSave: (new_date: string) => void;
    /** Input 너비 (기본값: 100) */
    width?: number;
    /** placeholder (기본값: "YYYY-MM-DD") */
    placeholder?: string;
    /** 비활성화 여부 */
    disabled?: boolean;
    /** 추가 스타일 */
    style?: React.CSSProperties;
}

/**
 * 날짜 입력 컴포넌트
 * 
 * @example
 * <DateInput
 *   value="2026-01-23"
 *   onSave={(date) => handleSave(date)}
 * />
 */
export function DateInput({
    value,
    onSave,
    width = 100,
    placeholder = "YYYY-MM-DD",
    disabled = false,
    style,
}: DateInputProps) {
    const [edit_value, setEditValue] = useState<string | null>(null);
    const is_editing = edit_value !== null;

    const handleFocus = () => {
        if (!disabled) {
            setEditValue(value);
        }
    };

    const handleBlur = () => {
        if (edit_value === null) return;

        // 날짜 형식 검증 (YYYY-MM-DD)
        if (isValidDateFormat(edit_value) && edit_value !== value) {
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

export default DateInput;
