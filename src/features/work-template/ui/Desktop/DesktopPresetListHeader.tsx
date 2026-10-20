import { Input, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
    TEMPLATE_CARD_TITLE,
    PRESET_SEARCH,
} from "@/features/work-template/constants";
import { SidebarToggleButton } from "@/shared/ui";
import { AddPresetButton } from "../AddPresetButton";

interface DesktopPresetListHeaderProps {
    add_shortcut_label: string;
    show_search: boolean;
    search_query: string;
    onAdd: () => void;
    onSearchChange: (query: string) => void;
    onCollapse: () => void;
}

export function DesktopPresetListHeader({
    add_shortcut_label,
    show_search,
    search_query,
    onAdd,
    onSearchChange,
    onCollapse,
}: DesktopPresetListHeaderProps) {
    return (
        <div className="flex flex-col gap-md px-lg pt-lg pb-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary m-0">
                    {TEMPLATE_CARD_TITLE}
                </h3>
                <SidebarToggleButton is_collapsed={false} onToggle={onCollapse} />
            </div>

            <Tooltip title={add_shortcut_label}>
                <AddPresetButton onClick={onAdd} />
            </Tooltip>

            {show_search && (
                <Input
                    variant="filled"
                    allowClear
                    prefix={<SearchOutlined className="text-text-disabled" />}
                    placeholder={PRESET_SEARCH.PLACEHOLDER}
                    value={search_query}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            )}
        </div>
    );
}
