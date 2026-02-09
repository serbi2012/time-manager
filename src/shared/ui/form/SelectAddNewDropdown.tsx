/**
 * Select dropdown render (새 옵션 추가)
 */

import { Input, Button, Space, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";

export interface SelectAddNewDropdownProps {
    /** 기존 메뉴 */
    menu: React.ReactNode;
    /** Input ref */
    input_ref: React.RefObject<InputRef | null>;
    /** Placeholder */
    placeholder: string;
    /** 입력 값 */
    value: string;
    /** 버튼 텍스트 */
    add_button_text: string;
    /** 입력 변경 핸들러 */
    onChange: (value: string) => void;
    /** 추가 핸들러 */
    onAdd: () => void;
}

/**
 * Select dropdown render - 새 옵션 추가 UI
 */
export function SelectAddNewDropdown({
    menu,
    input_ref,
    placeholder,
    value,
    add_button_text,
    onChange,
    onAdd,
}: SelectAddNewDropdownProps) {
    return (
        <>
            {menu}
            <Divider className="!my-sm" />
            <Space className="!px-sm !pb-xs !pt-0 !w-full">
                <Input
                    ref={input_ref}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    size="small"
                    className="!flex-1"
                />
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={onAdd}
                    size="small"
                >
                    {add_button_text}
                </Button>
            </Space>
        </>
    );
}
