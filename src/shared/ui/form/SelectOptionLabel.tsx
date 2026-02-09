/**
 * Select 옵션 레이블 (텍스트 + Close 버튼)
 */

import { CloseOutlined } from "@ant-design/icons";

export interface SelectOptionLabelProps {
    /** 표시할 텍스트 */
    label: React.ReactNode;
    /** 닫기 핸들러 */
    onClose: (e: React.MouseEvent) => void;
}

/**
 * Select 옵션 레이블 컴포넌트
 */
export function SelectOptionLabel({ label, onClose }: SelectOptionLabelProps) {
    return (
        <div className="flex justify-between items-center">
            <span>{label}</span>
            <CloseOutlined
                className="!text-[10px] !text-[#999] cursor-pointer"
                onClick={onClose}
            />
        </div>
    );
}
