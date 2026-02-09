/**
 * Expandable hidden items section within AutoComplete option card
 */

import { useState } from "react";
import { Button, Tag, Typography } from "antd";
import { EyeInvisibleOutlined, UndoOutlined } from "@ant-design/icons";
import {
    SETTINGS_AUTOCOMPLETE_HIDDEN,
    SETTINGS_AUTOCOMPLETE_RESTORE_ALL,
} from "../../constants";

const { Text } = Typography;

interface AutoCompleteHiddenSectionProps {
    hidden_list: string[];
    on_unhide: (value: string) => void;
    on_bulk_unhide: () => void;
}

const TOGGLE_BUTTON_CLASS =
    "!inline-flex !items-center !gap-[6px] !bg-transparent !border-none !cursor-pointer !p-[2px_0] !text-xs !text-[#8c8c8c] !appearance-none";

const ARROW_STYLE: React.CSSProperties = {
    fontSize: "10px",
    transition: "transform 0.2s",
};

const HIDDEN_CHIPS_CONTAINER_CLASS =
    "flex flex-wrap gap-xs mt-sm p-sm !bg-[#fafafa] !rounded-md";

const HIDDEN_TAG_CLASS =
    "!opacity-50 !line-through !rounded-full !text-[11px] !bg-[#f5f5f5]";

export function AutoCompleteHiddenSection({
    hidden_list,
    on_unhide,
    on_bulk_unhide,
}: AutoCompleteHiddenSectionProps) {
    const [is_expanded, setIsExpanded] = useState(false);

    if (hidden_list.length === 0) return null;

    return (
        <div
            className="mt-md pt-md"
            style={{ borderTop: "1px dashed #f0f0f0" }}
        >
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    className={TOGGLE_BUTTON_CLASS}
                    onClick={() => setIsExpanded(!is_expanded)}
                >
                    <EyeInvisibleOutlined />
                    <span>
                        {SETTINGS_AUTOCOMPLETE_HIDDEN} ({hidden_list.length}개)
                    </span>
                    <span
                        style={{
                            ...ARROW_STYLE,
                            transform: is_expanded
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                        }}
                    >
                        ▼
                    </span>
                </button>
                <Button
                    size="small"
                    type="link"
                    icon={<UndoOutlined />}
                    className="!text-xs !p-0"
                    onClick={on_bulk_unhide}
                >
                    {SETTINGS_AUTOCOMPLETE_RESTORE_ALL}
                </Button>
            </div>

            {is_expanded && (
                <div className={HIDDEN_CHIPS_CONTAINER_CLASS}>
                    {hidden_list.map((opt) => (
                        <Tag
                            key={opt}
                            closable
                            closeIcon={<UndoOutlined />}
                            onClose={(e) => {
                                e.preventDefault();
                                on_unhide(opt);
                            }}
                            className={HIDDEN_TAG_CLASS}
                        >
                            {opt}
                        </Tag>
                    ))}
                </div>
            )}
        </div>
    );
}
