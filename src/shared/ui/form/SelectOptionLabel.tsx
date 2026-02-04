/**
 * Select 옵션 레이블 (텍스트 + Close 버튼)
 */

import { CloseOutlined } from "@ant-design/icons";
import { OPTION_LABEL_CONTAINER_STYLE } from "./styles";

export interface SelectOptionLabelProps {
    /** 표시할 텍스트 */
    label: React.ReactNode;
    /** 닫기 아이콘 폰트 크기 */
    close_icon_size: number;
    /** 닫기 아이콘 색상 */
    close_icon_color: string;
    /** 닫기 핸들러 */
    onClose: (e: React.MouseEvent) => void;
}

/**
 * Select 옵션 레이블 컴포넌트
 */
export function SelectOptionLabel({
    label,
    close_icon_size,
    close_icon_color,
    onClose,
}: SelectOptionLabelProps) {
    return (
        <div style={OPTION_LABEL_CONTAINER_STYLE}>
            <span>{label}</span>
            <CloseOutlined
                style={{
                    fontSize: close_icon_size,
                    color: close_icon_color,
                    cursor: "pointer",
                }}
                onClick={onClose}
            />
        </div>
    );
}
