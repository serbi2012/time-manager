import { useState } from "react";
import { Dropdown, Popconfirm } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { cn } from "@/shared/lib/cn";
import {
    MENU_EDIT,
    MENU_DELETE,
    POPCONFIRM_DELETE_TITLE,
    POPCONFIRM_DELETE_DESCRIPTION,
    POPCONFIRM_OK_TEXT,
    POPCONFIRM_CANCEL_TEXT,
} from "@/features/work-template/constants";

interface TemplateCardMenuProps {
    onEdit: () => void;
    onDelete: () => void;
    className?: string;
}

export function TemplateCardMenu({
    onEdit,
    onDelete,
    className,
}: TemplateCardMenuProps) {
    const [confirm_open, setConfirmOpen] = useState(false);

    const items: MenuProps["items"] = [
        {
            key: "edit",
            label: MENU_EDIT,
            icon: <EditOutlined />,
        },
        { type: "divider" },
        {
            key: "delete",
            label: MENU_DELETE,
            icon: <DeleteOutlined />,
            danger: true,
        },
    ];

    const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
        domEvent.stopPropagation();
        if (key === "edit") {
            onEdit();
        } else if (key === "delete") {
            setConfirmOpen(true);
        }
    };

    return (
        <>
            <Dropdown
                menu={{ items, onClick: handleMenuClick }}
                trigger={["click"]}
                placement="bottomRight"
                overlayClassName="template-card-dropdown"
            >
                <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "flex items-center justify-center",
                        "w-7 h-7 rounded-md border-none cursor-pointer",
                        "bg-transparent text-text-disabled",
                        "hover:bg-bg-grey hover:text-text-secondary",
                        "transition-all duration-150",
                        className
                    )}
                >
                    <MoreOutlined className="text-sm" />
                </button>
            </Dropdown>

            <Popconfirm
                title={POPCONFIRM_DELETE_TITLE}
                description={POPCONFIRM_DELETE_DESCRIPTION}
                open={confirm_open}
                onConfirm={() => {
                    setConfirmOpen(false);
                    onDelete();
                }}
                onCancel={() => setConfirmOpen(false)}
                okText={POPCONFIRM_OK_TEXT}
                cancelText={POPCONFIRM_CANCEL_TEXT}
                okButtonProps={{ danger: true }}
                overlayClassName="template-card-popconfirm"
            >
                <span />
            </Popconfirm>
        </>
    );
}
