import {
    EditOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

import type { MobileActionMenuItem } from "@/shared/ui";
import { MOBILE_CONTEXT_MENU_LABEL } from "../../constants";

export const RECORD_MENU_KEY = {
    EDIT: "edit",
    COMPLETE: "complete",
    DELETE: "delete",
} as const;

export const RECORD_MENU_ITEMS: MobileActionMenuItem[] = [
    {
        key: RECORD_MENU_KEY.EDIT,
        label: MOBILE_CONTEXT_MENU_LABEL.EDIT,
        icon: EditOutlined,
        color: "var(--color-primary)",
        bg: "var(--color-primary-tint)",
    },
    {
        key: RECORD_MENU_KEY.COMPLETE,
        label: MOBILE_CONTEXT_MENU_LABEL.COMPLETE,
        icon: CheckCircleOutlined,
        color: "var(--color-success)",
        bg: "var(--color-success-tint)",
        haptic: "success",
    },
    {
        key: RECORD_MENU_KEY.DELETE,
        label: MOBILE_CONTEXT_MENU_LABEL.DELETE,
        icon: DeleteOutlined,
        color: "var(--color-error)",
        bg: "var(--color-error-tint)",
        haptic: "warning",
    },
];
