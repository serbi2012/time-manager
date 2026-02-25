/**
 * 테이블 정렬 상태 표시 아이콘
 */

import {
    CaretUpOutlined,
    CaretDownOutlined,
    MinusOutlined,
} from "@ant-design/icons";

interface SortIconProps {
    isSorted: false | "asc" | "desc";
}

export function SortIcon({ isSorted }: SortIconProps) {
    if (!isSorted) {
        return <MinusOutlined className="text-xs text-text-disabled ml-xs" />;
    }

    if (isSorted === "asc") {
        return <CaretUpOutlined className="text-xs text-primary ml-xs" />;
    }

    return <CaretDownOutlined className="text-xs text-primary ml-xs" />;
}
