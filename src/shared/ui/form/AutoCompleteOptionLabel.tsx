/**
 * AutoComplete 옵션 레이블 (HighlightText + Close 버튼)
 */

import { CloseOutlined } from "@ant-design/icons";
import { message } from "antd";
import { HighlightText } from "../HighlightText";
import type { HiddenAutoCompleteField } from "../../../store/types/store";

export interface AutoCompleteOptionLabelProps {
    /** 표시할 텍스트 */
    text: string;
    /** 검색어 (하이라이트용) */
    search: string;
    /** 옵션 값 */
    value: string;
    /** 옵션 타입 */
    option_type: HiddenAutoCompleteField;
    /** 옵션 숨기기 핸들러 */
    onHide: (field: HiddenAutoCompleteField, value: string) => void;
    /** 숨김 메시지 */
    hide_message: string;
}

/**
 * AutoComplete 옵션 레이블 컴포넌트
 */
export function AutoCompleteOptionLabel({
    text,
    search,
    value,
    option_type,
    onHide,
    hide_message,
}: AutoCompleteOptionLabelProps) {
    return (
        <div className="flex justify-between items-center">
            <span>
                <HighlightText text={text} search={search} />
            </span>
            <CloseOutlined
                className="!text-[10px] !text-[#999] cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onHide(option_type, value);
                    message.info(hide_message);
                }}
            />
        </div>
    );
}
