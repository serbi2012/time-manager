/**
 * AutoComplete 옵션 레이블 (HighlightText + Close 버튼)
 */

import { CloseOutlined } from "@ant-design/icons";
import { message } from "antd";
import { HighlightText } from "../HighlightText";
import { OPTION_LABEL_CONTAINER_STYLE } from "./styles";
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
    /** 닫기 아이콘 폰트 크기 */
    close_icon_size: number;
    /** 닫기 아이콘 색상 */
    close_icon_color: string;
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
    close_icon_size,
    close_icon_color,
    onHide,
    hide_message,
}: AutoCompleteOptionLabelProps) {
    return (
        <div style={OPTION_LABEL_CONTAINER_STYLE}>
            <span>
                <HighlightText text={text} search={search} />
            </span>
            <CloseOutlined
                style={{
                    fontSize: close_icon_size,
                    color: close_icon_color,
                    cursor: "pointer",
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onHide(option_type, value);
                    message.info(hide_message);
                }}
            />
        </div>
    );
}
