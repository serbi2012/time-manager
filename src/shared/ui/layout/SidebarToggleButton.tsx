import { Button, Tooltip } from "antd";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { SIDEBAR_LABELS } from "@/shared/constants";

interface SidebarToggleButtonProps {
    is_collapsed: boolean;
    onToggle: () => void;
}

export function SidebarToggleButton({
    is_collapsed,
    onToggle,
}: SidebarToggleButtonProps) {
    const label = is_collapsed ? SIDEBAR_LABELS.expand : SIDEBAR_LABELS.collapse;
    const Icon = is_collapsed ? DoubleRightOutlined : DoubleLeftOutlined;

    return (
        <Tooltip title={label} placement={is_collapsed ? "right" : "bottom"}>
            <Button
                type="text"
                size="small"
                aria-label={label}
                aria-expanded={!is_collapsed}
                icon={<Icon />}
                onClick={onToggle}
                className="!text-text-disabled hover:!text-primary"
            />
        </Tooltip>
    );
}
